import requests
import json

requests.packages.urllib3.disable_warnings()

session = ''
baseUrl = 'http://localhost:5000'

def send_request(urlStub, method, params):
  url = baseUrl + urlStub
  if method == 'GET' or method == 'DELETE':
    response = requests.request(
      method,
      headers = {},
      url = url,
      params = params,
      cookies = session,
      verify = False
    )
  else:
      response = requests.request(
      method,
      headers = {},
      url = url,
      json = params,
      cookies = session,
      verify = False
    )
  return response
