from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import json

app = Flask(__name__)
CORS(app)

# Load the data
car_data = pd.read_csv('static/car_data.csv')
oil_data = pd.read_csv('static/oil_data.csv')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/brands')
def get_brands():
    brands = car_data['Brand'].unique().tolist()
    return jsonify(brands)

@app.route('/api/models')
def get_models():
    brand = request.args.get('brand')
    models = car_data[car_data['Brand'] == brand]['Model'].unique().tolist()
    return jsonify(models)

@app.route('/api/years')
def get_years():
    brand = request.args.get('brand')
    model = request.args.get('model')
    years = car_data[(car_data['Brand'] == brand) & (car_data['Model'] == model)]['Year'].unique().tolist()
    return jsonify(years)

@app.route('/api/engine_types')
def get_engine_types():
    brand = request.args.get('brand')
    model = request.args.get('model')
    year = request.args.get('year')
    engine_types = car_data[(car_data['Brand'] == brand) & (car_data['Model'] == model) & (car_data['Year'] == year)]['Engine Type'].unique().tolist()
    return jsonify(engine_types)

@app.route('/api/oil')
def get_oil():
    brand = request.args.get('brand')
    model = request.args.get('model')
    year = request.args.get('year')
    engine_type = request.args.get('engine_type')
    oil_type = car_data[(car_data['Brand'] == brand) & (car_data['Model'] == model) & (car_data['Year'] == year) & (car_data['Engine Type'] == engine_type)]['Oil Type'].tolist()
    if len(oil_type) == 0:
        return jsonify("Oil type not found")
    else:
        oil_type = oil_type[0]
        amazon_link = oil_data[oil_data['Oil Type'] == oil_type]['Amazon Link'].tolist()[0]
        image_url = oil_data[oil_data['Oil Type'] == oil_type]['Image URL'].tolist()[0]
        return jsonify({'oil_type': oil_type, 'amazon_link': amazon_link, 'image_url': image_url})

if __name__ == '__main__':
    app.run(debug=True)
