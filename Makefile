server:
	python -m SimpleHTTPServer

init:
	npm install -g karma

test:
	karma start --single-run

karma:
	karma start

.PHONY: server init test karma
