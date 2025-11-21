from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import time
from datetime import datetime

app = Flask(__name__,
           static_folder='static',
           static_url_path='/static',
           template_folder='templates')

CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/test')
def test_api():
    return jsonify({
        'message': 'API routes are working!',
        'success': True
    })

@app.route('/api/content/generate', methods=['POST'])
def emergency_content_generate():
    try:
        data = request.get_json()
        topic = data.get('topic', 'AI 기술 혁신')

        return jsonify({
            'success': True,
            'content': f"# {topic}에 대한 분석\n\n{topic}는 중요한 기술입니다.",
            'title': f"{topic} 분석",
            'provider': 'emergency_api'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))

    print("🔍 DEBUG: Registered Routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.methods} {rule.rule} -> {rule.endpoint}")

    print(f"\n🚀 Starting Flask app on port {port}")
    app.run(debug=False, host='0.0.0.0', port=port)