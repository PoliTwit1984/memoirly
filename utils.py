import os
import anthropic
from config import logger

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
