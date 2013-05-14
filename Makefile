srcdir = src
ifndef DEBUG
	jekyll_config_files = config.yml
else
	jekyll_config_files = config.yml,config.development.yml
endif
icons = $(png_icons) $(srcdir)/favicon.ico
png_icons = icon-16.png icon-32.png $(srcdir)/apple-touch-icon-114.png $(srcdir)/apple-touch-icon-144.png
converter = convert
converter_input_flags = -density 288 -background none
converter_output_flags = -format png -colors 256 -depth 8
optimizer = optipng

build:
	jekyll build --config $(jekyll_config_files)

server:
	jekyll serve --watch --config $(jekyll_config_files)

init:
	bundle
	npm install -g karma

test:
	karma start --single-run

karma:
	karma start

icons: $(icons)

src/favicon.ico: icon-16.png icon-32.png
	$(converter) $^ $@
	rm -f $^

$(png_icons): $(srcdir)/img/icon.svg
	$(converter) $(converter_input_flags) $^ $(converter_output_flags) -resize $(shell sed -E 's/.*-([0-9]+)\.png/\1x\1/' <<< $@) $@
	$(optimizer) $@

clean:
	rm -f $(icons)

.PHONY: build server init test karma icons clean
