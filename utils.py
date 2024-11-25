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
                "content": f"Given a family relationship of {relationship} and these personal notes: {notes}, generate 10 meaningful and personal questions that would help capture family memories and stories. The questions should be specific to the relationship and context provided. Return only the questions, one per line."
            }
        ]
    )
    return [q.strip() for q in response.content[0].text.split('\n') if q.strip()]

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
