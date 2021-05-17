from flask import Flask, debughelpers
from flask_restful import Api, Resource

from files import Files
from pages import Pages
from visits import Visits
from surveys import Surveys

app = Flask(__name__)
api = Api(app)

api.add_resource(Visits, '/visits')
api.add_resource(Pages, '/pages')
api.add_resource(Files, '/files')
api.add_resource(Surveys, '/surveys')

if __name__ == "__main__":
    app.run(host= '0.0.0.0', port=5000, debug=True)
