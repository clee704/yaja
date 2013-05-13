icons = $(png_icons) public/favicon.ico
png_icons = icon-16.png icon-32.png public/apple-touch-icon-114.png public/apple-touch-icon-144.png
converter = convert
converter_input_flags = -density 288 -background none
converter_output_flags = -format png -colors 256 -depth 8
optimizer = optipng

server:
	cd public && python -m SimpleHTTPServer

init:
	npm install -g karma

test:
	karma start --single-run

karma:
	karma start

icons: $(icons)

public/favicon.ico: icon-16.png icon-32.png
	$(converter) $^ $@
	rm -f $^

$(png_icons): public/images/icon.svg
	$(converter) $(converter_input_flags) $^ $(converter_output_flags) -resize $(shell sed -E 's/.*-([0-9]+)\.png/\1x\1/' <<< $@) $@
	$(optimizer) $@

clean:
	rm -f $(icons)

.PHONY: server init test karma icons clean
