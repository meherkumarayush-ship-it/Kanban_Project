from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import mysql.connector

app = Flask(__name__)

# Config
app.config['JWT_SECRET_KEY'] = 'dev-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")
jwt = JWTManager(app)

def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='230604',
        database='kanban_db'
    )

# --- ROUTES (VIEW CONTROLLERS) ---

@app.route('/')
def home():
    # This makes the Register page the very first thing that opens
    return render_template('register.html')

@app.route('/login')
def login_page():
    # This shows the login page when they click "Already have an account?"
    return render_template('login.html')

@app.route('/board')
def board_page():
    # 1. Connect to MySQL
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # 2. Get all tasks from the 'tasks' table
    cursor.execute("SELECT * FROM tasks")
    tasks = cursor.fetchall()
    conn.close()
    
    # 3. Pass that 'tasks' data into your index.html
    return render_template('index.html', tasks=tasks)


# --- API ENDPOINTS ---

# 1. Authentication Endpoints
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Simple password storage for fresher project (consider bcrypt later)
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", 
                       (data['username'], data['password']))
        conn.commit()
        return jsonify({"msg": "Success"}), 201
    except Exception as e:
        return jsonify({"msg": "User exists or error occurred"}), 400
    finally:
        conn.close()

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username=%s AND password_hash=%s", 
                   (data['username'], data['password']))
    user = cursor.fetchone()
    conn.close()
    if user:
        # Create token with user ID
        token = create_access_token(identity=str(user['id']))
        return jsonify(access_token=token)
    return jsonify({"msg": "Failed"}), 401


# 2. Board Endpoints (Requirement 7)
@app.route('/boards', methods=['POST'])
@jwt_required()
def create_board():
    user_id = get_jwt_identity()
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO boards (name, owner_id) VALUES (%s, %s)", (data['name'], user_id))
    board_id = cursor.lastrowid
    
    # Automatically create default columns: To Do, In Progress, Done
    columns = [('To Do', 1), ('In Progress', 2), ('Done', 3)]
    for title, pos in columns:
        cursor.execute("INSERT INTO lists (board_id, title, position) VALUES (%s, %s, %s)", 
                       (board_id, title, pos))
    
    conn.commit()
    conn.close()
    return jsonify({"board_id": board_id}), 201

# 3. Task Endpoints
@app.route('/tasks', methods=['POST'])
@jwt_required()
def add_task():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO tasks (list_id, title, description) VALUES (%s, %s, %s)", 
                   (data['list_id'], data['title'], data.get('description', '')))
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    
    # Notify other users that a task was created
    socketio.emit('task_created', {'task_id': task_id, 'list_id': data['list_id'], 'title': data['title']})
    return jsonify({"id": task_id}), 201

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Delete the task from the database
    cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
    
    conn.commit()
    conn.close()
    
    # Notify other users via Socket.IO that a task was deleted
    socketio.emit('task_deleted', {'task_id': task_id})
    return jsonify({"msg": "Task deleted"}), 200

# --- REAL-TIME EVENTS ---

@socketio.on('move_task')
def on_move(data):
    # Update DB
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE tasks SET list_id=%s WHERE id=%s", (data['new_list_id'], data['task_id']))
    conn.commit()
    conn.close()
    
    # Broadcast to everyone else
    emit('task_updated', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)