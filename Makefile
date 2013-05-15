all:
	npm install
	node pants -l
	node pants

clean:
	rm -rf node_modules
