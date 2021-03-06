var DashboardController = {
    lastUdpSend: Date.now(),
    showToast: function (message) {
        $('.toastMessage').text(message);
        $('.toastMessage').stop().fadeIn(400).delay(3000).fadeOut(400);
    },
    toggleRelay: function (componentId) {

        $.get("?route=ajax&action=toggleRelay&id=" + componentId,
            function (data, status) {
                DashboardController.onRelayToggled(data, status);
            });

        this.showToast("Trying to toggle relay with identifier " + componentId + ".");
    },
    onRelayToggled: function (data, status) {
        this.showToast("Relay toggled.");
    },
    setWarmWhite: function (componentId, warmWhite) {
        $.get("?route=ajax&action=setWarmWhite&id=" + componentId + "&ww=" + warmWhite,
            function (data, status) {
                DashboardController.onWarmWhiteSet(data, status);
            });

        this.showToast("Sent warm white value to led strip with ID " + componentId + ".");
    },
    onWarmWhiteSet: function (data, status) {
        this.showToast("Warm white set.");
    },
    setColor: function (componentId, color) {
        var cleanRgb = ColorConversion.hsvToRgb(color.hsv[0], color.hsv[1], color.hsv[2]);

        $.get("?route=ajax&action=setColor&id=" + componentId + "&r="
            + cleanRgb.r + "&g=" + cleanRgb.g + "&b=" + cleanRgb.b,
            function (data, status) {
                DashboardController.onColorSet(data, status);
            });

        this.showToast("Sent color value to led strip with ID " + componentId + ".");
    },
    onColorSet: function (data, status) {
        this.showToast("Color set.");
    },
    setColorUdp: function (componentId, color) {
        if (lastUdpSend + 200 < Date.now()) {
            lastUdpSend = Date.now();

            var cleanRgb = hsvToRgb(color.hsv[0], color.hsv[1], color.hsv[2]);
            var ww = $('#warmWhiteLedStrip' + componentId)[0].value;

            console.log(cleanRgb);

            $.get("?route=ajax&action=setColorUdp&id=" + componentId + "&r="
                + cleanRgb.r + "&g=" + cleanRgb.g + "&b=" + cleanRgb.b + "&ww=" + ww,
                function (data, status) {
                    DashboardController.onColorSet(data, status);
                }
            );
        }
    },
    requestDashboardGrid: function () {
        $.get("?route=ajax&action=getDashboardView",
            function (data, status) {
                var grid = $('.grid-stack').data('gridstack');
                var parsedContent = $('<div></div>');
                parsedContent.html(data);

                var espTiles = $('.grid-stack-item-content', parsedContent);
                $.get("?route=ajax&action=getGridLayout",
                    function (data, status) {
                        var gridLayout = JSON.parse(data);

                        for (var i = 0; i < espTiles.length; ++i) {
                            var espTile = $('<div></div>');
                            espTile.html(espTiles[i]);
                            var id = espTile[0].firstChild.id;
                            var oldTile = $('#' + id);

                            if (oldTile.exists()) {
                                oldTile = oldTile[0].parentElement;
                                var attributes = oldTile.attributes;
                                grid.removeWidget(oldTile);
                                grid.addWidget(espTile, gridLayout[i].x,
                                    gridLayout[i].y, gridLayout[i].width,
                                    gridLayout[i].height, false);
                            } else {
                                grid.addWidget(espTile,
                                    gridLayout[i].x, gridLayout[i].y,
                                    gridLayout[i].width, gridLayout[i].height,
                                    false);
                            }
                        }

                        $.get("?route=ajax&action=getComponentOrder",
                            function (data, status) {
                                var fullComponentOrder = JSON.parse(data);
                                DashboardController.loadComponentOrder(fullComponentOrder);
                                var root = $('.loading').removeClass('loading');
                                root.addClass('root');
                                $('#dashboardView').visible();

                                jscolor.installByClassName("jscolor");
                                $('.grid-stack').on('change', function (event, items) {
                                    DashboardController.saveGrid();
                                });
                                $('.arrowDown').click(DashboardController.onBtnClickArrowDown);
                                $('.arrowUp').click(DashboardController.onBtnClickArrowUp);
                                $('.halfIcon').click(DashboardController.onBtnClickHalf);
                                $('.growIcon').click(DashboardController.onBtnClickGrow);
                            }
                        );
                    }
                );
            }
        );
    },
    onComponentAdded: function(esp, component) {
        var componentOrder = DashboardController.getComponentOrder();
        var gridIdEsp = $('#esp' + esp).parent().index();
        componentOrder[gridIdEsp].push("" + component);
        DashboardController.saveComponentOrder(componentOrder);
    },
    onBtnClickArrowUp: function() {
        var currentRow = $(this).parents('.componentRow');
        var prevRow = currentRow.prev('.componentRow');
        var clickedComponent = $(this).parents('.componentTile');

        if (currentRow.children().length === 1 &&
            prevRow.children().length === 1) {
            currentRow.moveUp();
        } else if (currentRow.children('.componentTile').first().id() === clickedComponent.id()) {
            if (prevRow.children().length > 0) {
                var prevComponent = prevRow.children().last();
                clickedComponent.remove();
                prevComponent.remove();
                currentRow.prepend(prevComponent);
                prevRow.append(clickedComponent);
                DashboardController.bindSortButtons(prevComponent);
                DashboardController.bindSortButtons(clickedComponent);
            }
        } else {
            clickedComponent.moveUp();
        }

        DashboardController.setArrowDirections();
        DashboardController.saveComponentOrder(DashboardController.getComponentOrder());
    },
    onBtnClickArrowDown: function() {
        var currentRow = $(this).parents('.componentRow');
        var nextRow = currentRow.next('.componentRow');
        var clickedComponent = $(this).parents('.componentTile');

        if (currentRow.children().length === 1 &&
            nextRow.children().length === 1) {
            currentRow.moveDown();
        } else if (currentRow.children('.componentTile').last().id() === clickedComponent.id()) {
            if (nextRow.children().length > 0) {
                var nextComponent = nextRow.children().first();
                clickedComponent.remove();
                nextComponent.remove();
                currentRow.append(nextComponent);
                nextRow.prepend(clickedComponent);
                DashboardController.bindSortButtons(nextComponent);
                DashboardController.bindSortButtons(clickedComponent);
            }
        } else {
            clickedComponent.moveDown();
        }

        DashboardController.setArrowDirections();
        DashboardController.saveComponentOrder(DashboardController.getComponentOrder());
    },
    onBtnClickGrow: function() {
        var currentRow = $(this).parents('.componentRow');
        var nextRow = currentRow.next('.componentRow');
        var clickedComponent = $(this).parents('.componentTile');
        var nextComponent = clickedComponent.next('.componentTile');

        if (currentRow.children().length === 1) return;

        if (clickedComponent.id() === currentRow.children().last().id()) {
            if (nextRow.children().length > 0) {
                clickedComponent.remove();
                var newRow = clickedComponent.wrap($('<div class="componentRow"></div>')).parent();
                currentRow.after(newRow);
            } else {
                clickedComponent.remove();
                nextRow.prepend(clickedComponent);
            }

            DashboardController.bindSortButtons(clickedComponent);
        } else {
            nextComponent.remove();
            nextRow.prepend(nextComponent);
        }

        DashboardController.setArrowDirections();
        DashboardController.bindSortButtons(nextComponent);
        DashboardController.saveComponentOrder(DashboardController.getComponentOrder());
    },
    onBtnClickHalf: function() {
        var currentRow = $(this).parents('.componentRow');
        var nextRow = currentRow.next('.componentRow');
        var clickedComponent = $(this).parents('.componentTile');

        var nextComponent = nextRow.children('.componentTile').first();
        nextComponent.remove();
        currentRow.append(nextComponent);

        if (nextRow.children().length === 0) {
            nextRow.remove();
            $(this).parents('.grid-stack-item-content').append(nextRow);
        }

        DashboardController.setArrowDirections();
        DashboardController.bindSortButtons(nextComponent);
        DashboardController.saveComponentOrder(DashboardController.getComponentOrder());
    },
    setArrowDirections: function() {
        $('.componentRow').each(function () {
            $(this).children().each(function () {
                var components = $(this).parent('.componentRow').children();
                $(this).find('.arrowUp').attr('src', 'img/arrowLeft.png');
                $(this).find('.arrowDown').attr('src', 'img/arrowRight.png');

                if (components.length > 1) {
                    components.first().find('.arrowUp').attr('src', 'img/arrowUp.png');
                    components.first().find('.arrowDown').attr('src', 'img/arrowRight.png');
                    components.last().find('.arrowUp').attr('src', 'img/arrowLeft.png');
                    components.last().find('.arrowDown').attr('src', 'img/arrowDown.png');
                } else {
                    components.first().find('.arrowUp').attr('src', 'img/arrowUp.png');
                    components.first().find('.arrowDown').attr('src', 'img/arrowDown.png');
                }
            })
        });
    },
    bindSortButtons: function(componentTile) {
        componentTile.find('.halfIcon').click(DashboardController.onBtnClickHalf);
        componentTile.find('.arrowUp').click(DashboardController.onBtnClickArrowUp);
        componentTile.find('.arrowDown').click(DashboardController.onBtnClickArrowDown);
        componentTile.find('.growIcon').click(DashboardController.onBtnClickGrow);
    },
    getComponentOrder: function() {
        var fullComponentOrder = [];
        $('.grid-stack-item').each(function () {
            var rowComponentOder = [];
            $(this).find('.componentRow').each(function (index) {
                var components = $(this).find('.componentTile');
                var componentOrder = [];
                for (var i = 0; i < components.length; ++i) {
                    componentOrder.push(components[i].id.split('component')[1]);
                }

                rowComponentOder.push(componentOrder);
            });
            fullComponentOrder.push(rowComponentOder);
        });

        return fullComponentOrder;
    },
    saveComponentOrder: function(componentOrder) {
        $.post("", {ComponentOrder: JSON.stringify(componentOrder)}).done(function (data) {

        });
    },
    loadComponentOrder: function(fullComponentOrder) {
        $('.grid-stack-item').each(function (index) {
            var components = $(this).find('.componentTile');

            for (i = 0; i < components.length; ++i) {
                components[i].remove();
            }

            for (var i = 0; i < fullComponentOrder[index].length; ++i) {
                for (var j = 0; j < fullComponentOrder[index][i].length; ++j) {
                    for (var k = 0; k < components.length; ++k) {
                        if (components[k].id.split('component')[1] === fullComponentOrder[index][i][j]) {
                            $(this).find('.componentRow:eq(' + i + ')').append(components[k]);
                        }
                    }
                }
            }
        });

        DashboardController.setArrowDirections();
    },
    saveGrid: function () {
        this.serializedData = _.map($('.grid-stack > .grid-stack-item:visible'), function (el) {
            el = $(el);
            var node = el.data('_gridstack_node');
            return {
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height
            };
        }, this);

        console.log(this.serializedData);

        $.post("", {GridLayout: JSON.stringify(this.serializedData)}).done(function (data) {

        });
    }
};