from flask import Blueprint, render_template
from config import app, db
from auth import auth
from family import family
from questions import questions

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/thank_you')
def thank_you():
    return render_template('thank_you.html')

# Register blueprints
app.register_blueprint(main)
app.register_blueprint(auth)
app.register_blueprint(family)
app.register_blueprint(questions)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=3001)
