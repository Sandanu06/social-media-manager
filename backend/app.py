# app.py
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///social_scheduler.db'
app.config['SECRET_KEY'] = 'your-secret-key'  # Change in production
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    accounts = db.relationship('SocialAccount', backref='user', lazy=True)
    posts = db.relationship('ScheduledPost', backref='user', lazy=True)

class SocialAccount(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    platform = db.Column(db.String(50), nullable=False)  # e.g., 'twitter', 'linkedin', 'facebook'
    account_name = db.Column(db.String(100), nullable=False)
    access_token = db.Column(db.String(500))
    refresh_token = db.Column(db.String(500))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class ScheduledPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    media_urls = db.Column(db.Text)  # JSON string of media URLs
    scheduled_time = db.Column(db.DateTime, nullable=False)
    platforms = db.Column(db.String(200))  # JSON string of platform IDs
    status = db.Column(db.String(20), default='pending')  # pending, published, failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

@app.route('/api/schedule-post', methods=['POST'])
def schedule_post():
    data = request.get_json()
    try:
        post = ScheduledPost(
            content=data['content'],
            media_urls=data['media_urls'],
            scheduled_time=datetime.fromisoformat(data['scheduled_time']),
            platforms=data['platforms'],
            user_id=get_current_user_id()
        )
        db.session.add(post)
        db.session.commit()
        return jsonify({'message': 'Post scheduled successfully', 'id': post.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/posts', methods=['GET'])
def get_posts():
    user_id = get_current_user_id()
    posts = ScheduledPost.query.filter_by(user_id=user_id).order_by(ScheduledPost.scheduled_time).all()
    return jsonify([{
        'id': post.id,
        'content': post.content,
        'scheduled_time': post.scheduled_time.isoformat(),
        'status': post.status
    } for post in posts])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)