from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Load the datasets
car_df = pd.read_csv('static/car_data.csv')
oil_df = pd.read_csv('static/oil_data.csv')

@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/api/brands')
def get_brands():
    brands = car_df['Brand'].unique().tolist()
    return jsonify(brands)

@app.route('/api/models')
def get_models():
    brand = request.args.get('brand', '')
    models = car_df[car_df['Brand'] == brand]['Model'].unique().tolist()
    return jsonify(models)

@app.route('/api/years')
def get_years():
    brand = request.args.get('brand', '')
    model = request.args.get('model', '')
    years = car_df[(car_df['Brand'] == brand) & (car_df['Model'] == model)]['Year'].unique().tolist()
    return jsonify(years)

@app.route('/api/engine_types')
def get_engine_types():
    brand = request.args.get('brand', '')
    model = request.args.get('model', '')
    year = request.args.get('year', '')
    engine_types = car_df[(car_df['Brand'] == brand) & (car_df['Model'] == model) & (car_df['Year'] == int(year))]['Engine Type'].unique().tolist()
    return jsonify(engine_types)

@app.route('/api/oil')
def get_oil_type():
    brand = request.args.get('brand', '')
    model = request.args.get('model', '')
    year = request.args.get('year', '')
    engine_type = request.args.get('engine_type', '')

    car = car_df[(car_df['Brand'] == brand) & 
                 (car_df['Model'] == model) & 
                 (car_df['Year'] == int(year)) &
                 (car_df['Engine Type'] == engine_type)]

    if car.empty:
        return jsonify('Oil type not found')

    oil_type = car['Oil Type'].values[0]
    oil_info = oil_df[oil_df['Oil Type'] == oil_type]

    if oil_info.empty:
        return jsonify({'oil_type': oil_type, 'amazon_link': None, 'image_url': None})

    amazon_link = oil_info['Amazon Link'].values[0]
    if not amazon_link:
        return jsonify({'oil_type': oil_type, 'amazon_link': None, 'image_url': None})

    # Fetch the primary image from the Amazon link
    response = requests.get(amazon_link)
    soup = BeautifulSoup(response.content, 'html.parser')
    image_tag = soup.find('img', {'id': 'landingImage'})
    image_url = image_tag['src'] if image_tag else None

    return jsonify({'oil_type': oil_type, 'amazon_link': amazon_link, 'image_url': image_url})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
