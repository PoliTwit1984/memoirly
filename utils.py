import os
import anthropic
from config import logger
from flask import url_for
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

def generate_questions(relationship, notes):
    client = anthropic.Anthropic(
        api_key=os.getenv('ANTHROPIC_API_KEY')
    )
    
    response = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=1000,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": f"""You are a family memory historian. Based on the user's family relationship ({relationship}) and these personal notes: {notes}, generate 25 meaningful and deeply personal questions designed to capture valuable family memories and stories. 

            The questions should be specific to the relationship and context provided and categorized into five distinct themes:
            
            1. **Childhood and Early Life** (e.g., early memories, family traditions, or personal milestones)
            2. **Family Relationships** (e.g., connections with other family members, influences, or shared experiences)
            3. **Major Life Events** (e.g., challenges, successes, or turning points)
            4. **Life Wisdom and Values** (e.g., lessons learned, advice, or guiding principles)
            5. **Fun and Quirky Reflections** (e.g., favorite moments, hobbies, or light-hearted anecdotes)
            
            Format your response exactly as follows:
            [Category: Childhood and Early Life]
            Question 1
            Question 2
            Question 3
            Question 4
            Question 5
            [Category: Family Relationships]
            Question 1
            Question 2
            ...and so on for each category.
            
            Provide 5 specific and engaging questions under each theme. Ensure the questions are thought-provoking and encourage storytelling."""
            }
        ]
    )
    
    # Parse the response to extract categories and questions
    lines = [line.strip() for line in response.content[0].text.split('\n') if line.strip()]
    result = []
    current_category = None
    
    for line in lines:
        if line.startswith('[Category:'):
            current_category = line[10:-1].strip()  # Extract category name
        elif line and current_category:
            result.append({
                'content': line,
                'category': current_category
            })
    
    return result

def improve_question_with_ai(question, relationship):
    try:
        logger.debug(f"Attempting to improve question: {question} for relationship: {relationship}")
        
        client = anthropic.Anthropic(
            api_key=os.getenv('ANTHROPIC_API_KEY')
        )
        
        logger.debug("Created Anthropic client")
        
        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1000,
            temperature=0,
            messages=[
                {
                    "role": "user",
                    "content": f"I want to ask my {relationship} this question: '{question}'. Please improve this question to make it more personal, engaging, and likely to elicit meaningful memories and stories. Keep the same general topic but make it more specific and emotionally resonant. Return only the improved question."
                }
            ]
        )
        
        logger.debug(f"Received response from Anthropic: {response}")
        improved_question = response.content[0].text.strip()
        logger.debug(f"Improved question: {improved_question}")
        
        return improved_question
    except Exception as e:
        logger.error(f"Error in improve_question_with_ai: {str(e)}", exc_info=True)
        raise

def send_invitation_email(email, tribe, token):
    """Send an invitation email to join a tribe"""
    try:
        smtp_server = os.getenv('SMTP_SERVER')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        smtp_username = os.getenv('SMTP_USERNAME')
        smtp_password = os.getenv('SMTP_PASSWORD')
        sender_email = os.getenv('SENDER_EMAIL')

        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"Join {tribe.name} on Memoirly"
        msg['From'] = sender_email
        msg['To'] = email

        # Create HTML version of the email
        invitation_link = url_for('main.join_tribe', token=token, _external=True)
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2b6cb0;">You're Invited to Join {tribe.name}</h2>
                    
                    <p>You've been invited to join a tribe on Memoirly, where you can:</p>
                    <ul>
                        <li>Share and preserve memories with your tribe</li>
                        <li>Answer meaningful questions about your life</li>
                        <li>Connect with tribe members through stories</li>
                        <li>Contribute your own questions for tribe members</li>
                    </ul>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{invitation_link}" 
                           style="background-color: #2b6cb0; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 4px; display: inline-block;">
                            Join Tribe
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 0.9em;">
                        This invitation will expire in 7 days. If you have any questions, please contact us.
                    </p>
                </div>
            </body>
        </html>
        """

        # Attach HTML version
        msg.attach(MIMEText(html, 'html'))

        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)

        logger.info(f"Invitation email sent successfully to {email}")
    except Exception as e:
        logger.error(f"Error sending invitation email to {email}: {str(e)}", exc_info=True)
        raise

def format_timeago(timestamp):
    """Format a timestamp into a human-readable 'time ago' string"""
    from datetime import datetime
    now = datetime.utcnow()
    diff = now - timestamp

    seconds = diff.total_seconds()
    minutes = seconds // 60
    hours = minutes // 60
    days = diff.days

    if days > 30:
        months = days // 30
        return f"{int(months)} month{'s' if months != 1 else ''} ago"
    elif days > 0:
        return f"{int(days)} day{'s' if days != 1 else ''} ago"
    elif hours > 0:
        return f"{int(hours)} hour{'s' if hours != 1 else ''} ago"
    elif minutes > 0:
        return f"{int(minutes)} minute{'s' if minutes != 1 else ''} ago"
    else:
        return "just now"

def get_notification_digest(user, frequency='daily'):
    """Generate a notification digest for a user"""
    from models import Notification
    from datetime import datetime, timedelta

    # Calculate the time range based on frequency
    now = datetime.utcnow()
    if frequency == 'daily':
        start_time = now - timedelta(days=1)
    elif frequency == 'weekly':
        start_time = now - timedelta(weeks=1)
    else:  # monthly
        start_time = now - timedelta(days=30)

    # Get unread notifications
    notifications = (Notification.query
                    .filter_by(user_id=user.id)
                    .filter(Notification.created_at >= start_time)
                    .filter(Notification.read_at.is_(None))
                    .order_by(Notification.created_at.desc())
                    .all())

    return notifications
