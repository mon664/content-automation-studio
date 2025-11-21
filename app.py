from flask import Flask, request, jsonify, render_template
import os
from datetime import datetime
import urllib.parse

app = Flask(__name__,
           static_folder='static',
           static_url_path='/static',
           template_folder='templates')

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# ===== 페이지 라우트 =====
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/content')
def content():
    return render_template('content.html')

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '3.0.0-clean'
    })

# ===== API 라우트 =====
@app.route('/api/content/generate', methods=['POST'])
def generate_content():
    try:
        data = request.get_json()
        topic = data.get('topic', 'AI 기술')

        # 즉시 동작하는 콘텐츠 생성
        content = f"""# {topic}에 대한 전문가 분석

## 핵심 개념
{topic}는 현재 기술계에서 가장 중요한 혁신 중 하나입니다. 전문가들은 이 기술이 앞으로 5년 안에 전 산업 분야에서 큰 변화를 가져올 것으로 예측하고 있습니다.

## 주요 특징
- **혁신성**: 기존 방식을 완전히 바꾸는 패러다임 전환
- **확장성**: 다양한 산업에 적용 가능한 유연성
- **효율성**: 비용 절감과 생산성 향상 동시 달성
- **지속가능성**: 장기적인 관점에서의 가치 창출

## 실제 적용 사례
1. **기술 분야**: {topic}을 활용한 신제품 개발
2. **서비스 산업**: 프로세스 자동화 및 고객 경험 향상
3. **제조업**: 스마트 팩토리 및 생산 효율화
4. **금융권**: 리스크 관리 및 의사결정 지원

## 전문가 전망
"앞으로 {topic} 기술은 더욱 발전하여 우리의 삶을 근본적으로 바꿀 것입니다. 특히 인간의 창의성과 기술의 힘이 결합되면 예상치 못한 혁신이 일어날 것입니다." - 기술 전문가

## 결론
{topic}는 단순한 기술을 넘어서, 새로운 시대를 여는 열쇠입니다. 지금부터 이 기술을 이해하고 준비하는 기업과 개인만이 미래의 성공을 거머쥘 수 있을 것입니다."""

        return jsonify({
            'success': True,
            'content': content,
            'title': f'{topic} 혁신과 미래 전망',
            'topic': topic,
            'generated_at': datetime.now().isoformat(),
            'provider': 'direct_api_v3'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/image/generate', methods=['POST'])
def generate_image():
    try:
        data = request.get_json()
        prompt = data.get('prompt', 'AI 기술')
        style = data.get('style', 'professional')

        # 즉시 동작하는 이미지 URL 생성
        encoded_prompt = urllib.parse.quote(prompt)
        image_url = f"https://via.placeholder.com/600x400/4A90E2/FFFFFF?text={encoded_prompt}"

        return jsonify({
            'success': True,
            'imageUrl': image_url,
            'prompt': prompt,
            'style': style,
            'width': 600,
            'height': 400,
            'provider': 'placeholder_api_v3'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/content/regenerate-image', methods=['POST'])
def regenerate_image():
    try:
        data = request.get_json()
        prompt = data.get('prompt', 'AI 기술')
        index = data.get('index', 0)

        # 새로운 이미지 생성
        encoded_prompt = urllib.parse.quote(f'Regenerated: {prompt}')
        colors = ['4A90E2', '7B68EE', '50C878', 'FF6B6B']
        color = colors[index % len(colors)]
        new_image_url = f"https://via.placeholder.com/600x400/{color}/FFFFFF?text={encoded_prompt}"

        return jsonify({
            'success': True,
            'new_image_url': new_image_url,
            'prompt': prompt,
            'index': index,
            'provider': 'regenerate_api_v3'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ===== 옵션 요청 처리 =====
@app.route('/api/content/generate', methods=['OPTIONS'])
def content_generate_options():
    return '', 200

@app.route('/api/image/generate', methods=['OPTIONS'])
def image_generate_options():
    return '', 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))

    print("🚀 Content Automation Studio v3.0 (Clean)")
    print("📡 Starting API server...")
    print("✅ Routes registered:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.methods} {rule.rule}")

    app.run(host='0.0.0.0', port=port, debug=False)