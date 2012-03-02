var fm = (function (fm) {
    var App = fm.App,
        cfg = fm.cfg,
        env = fm.env,
        debug = fm.debug;

    App.Views.SelectToolbar = Backbone.View.extend({
        tagName: "form",
        id: "fm-file-drop-zone",

        templates: {
            icon_size: Handlebars.compile($(cfg.id.icon_size).html()),
            use_embedded: Handlebars.compile($(cfg.id.use_embedded).html())
        },

        events: {
            "click .fm-icon-size-button": "changeIconSize",
            "click #fm-file-browse-button": "fileBrowse",
            "change #fm-file": "fileUpload",
            "dragover #fm-file-drop-zone": "fileDragOver", // doesn't work
            "drop #fm-file-drop-zone": "fileDrop",         // doesn't work
            "click .fm-font-name": "useEmbedded"
        },

        initialize: function () {
            console.log("Views.SelectToolbar.initialize");
            _.bindAll(this);
        },

        render: function () {
            console.log("Views.SelectToolbar.render");
            var self = this;

            // render icon size buttons
            var tpl_vars = {buttons: cfg.preview_icon_sizes};
            $(cfg.id.icon_size).html(this.templates.icon_size(tpl_vars))
                .find("button:first").addClass("active");

            // FIXME: workaround, because dragover/drag events don't work
            if (env.filereader) {
                // init file drag and drop
                $(cfg.id.file_drop_zone).on("dragover", function (event) {
                    self.fileDragOver(event);
                });
                $(cfg.id.file_drop_zone).on("drop", function (event) {
                    self.fileDrop(event);
                });
            }

            this.renderUseEmbedded();

            return this;
        },

        renderUseEmbedded: function () {
            console.log("Views.SelectToolbar.renderUseEmbedded");
            var tpl_vars = {
                options: _.map(fm_embedded_fonts, function (item) {
                    return {
                        text: item.fontname,
                        disabled: item.is_added
                    };
                })
            };
            $(cfg.id.use_embedded).html(this.templates.use_embedded(tpl_vars))
                .find(cfg.class.font_name).each(function (i) {
                    $(this).data("embedded_id", i);
                });
        },

        useEmbedded: function (event) {
            console.log("Views.SelectToolbar.useEmbedded");
            event.preventDefault();
            var id = $(event.target).data("embedded_id"),
                font = fm_embedded_fonts[id];
            console.assert(font);
            if (font && !font.is_added)
                App.mainview.addEmbeddedFonts([font]);
        },

        fileBrowse: function (event) {
            event.preventDefault();
            if (env.filereader) {
                $(cfg.id.file).click();
            } else {
                util.notify_alert("File upload is not supported by your"
                    + " browser, use embedded fonts instead");
            }
        },

        fileUpload: function (event) {
            App.mainview.addUploadedFonts(event.target.files);
        },

        fileDragOver: function (event) {
            //console.log("fileDragOver");
            if (env.filereader) {
                event.stopPropagation();
                event.preventDefault();
                event.originalEvent.dataTransfer.dropEffect = 'copy';
            }
        },

        fileDrop: function (event) {
            console.log("fileDrop");
            if (env.filereader) {
                event.stopPropagation();
                event.preventDefault();
                App.mainview.addUploadedFonts(
                    event.originalEvent.dataTransfer.files
                );
            }
        },

        changeIconSize: function (event) {
            console.log("Views.SelectToolbar.changeIconSize");
            event.preventDefault();
            var size = parseInt($(event.target).val())
                || cfg.preview_icon_sizes[0];
            console.log('size='+size);

            // attach class
            $(cfg.class.glyph_group)
                .removeClass(cfg.icon_size_classes)
                .addClass(cfg.icon_size_prefix + size);

            // change width/height
            $(cfg.id.font_list).find(cfg.class.glyph_div).each(function (i) {
                var $this = $(this),
                    size_x = $this.data("glyph_sizes")[size][0],
                    size_y = $this.data("glyph_sizes")[size][1];

                $this.css({
                    width: size_x + "px",
                    height: size_y + "px",
                    "margin-left": "-" + Math.round(size_x/2) + "px",
                    "margin-top": "-" + Math.round(size_y/2) + "px"
                }).find("svg").css({
                    width: size_x + "px", 
                    height: size_y + "px"
                });
            });

            // do the same on the rearrange tab
            $(cfg.id.generated_font)
                .removeClass(cfg.icon_size_classes)
                .addClass(cfg.icon_size_prefix + size);

            // change width/height
            $(cfg.id.generated_font).find(cfg.class.rg_icon).each(function (i) {
                var $this = $(this),
                    glyph_id = $(this).parent().siblings(".fm-glyph-id").val(),
                    size_x = size,
                    size_y = size;

                // FIXME
                if (glyph_id != "") {
                    size_x = $this.data("glyph_sizes")[size][0],
                    size_y = $this.data("glyph_sizes")[size][1];
                }

                $this.css({
                    width: size_x + "px",
                    height: size_y + "px",
                    "margin-left": "-" + Math.round(size_x/2) + "px",
                    "margin-top": "-" + Math.round(size_y/2) + "px"
                }).css({    // FIXME: move it to css
                    width: "100%",
                    left: "0px",
                    "margin-left": "0px"
                }).find("svg").css({
                    width: size_x + "px",
                    height: size_y + "px"
                });
            });
        }
    });

    return fm;
})(fm || {});