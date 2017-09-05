var ConfigController = {
    requestConfigView: function () {
        $.get("?route=ajax&action=getConfigView",
            function (data, status) {
                var configView = $('#configView');
                var parsedContent = $('<div></div>');
                parsedContent.html(data);
                configView.html(parsedContent);
                ConfigController.addRowHandlers();
                $('.configDetail').hide();
                $('.droppable').droppable({
                    over: function () {
                        $(this).parent('tr').children().addClass("droppableHover");
                        $(this).parent('tr').next().find('tr').children().addClass("droppableHover");
                    },
                    out: function () {
                        $(this).parent('tr').children().removeClass("droppableHover");
                        $(this).parent('tr').next().find('tr').children().removeClass("droppableHover");
                    },
                    drop: function (event, ui) {
                        $(this).parent('tr').children().removeClass("droppableHover");
                        $(this).parent('tr').next().find('tr').children().removeClass("droppableHover");
                        var regex = new RegExp('[0-9]');
                        var espId = event.target.parentElement.id;
                        espId = regex.exec(espId)[0];
                        var typeId = ui.draggable[0].id;
                        ConfigController.addComponent(espId, typeId);
                    }
                });

                $('#configDraggableContainer').children().draggable({revert: true});

                $('.nameColumn').prop('contentEditable', true);
                $('.nameColumn').keypress(function (event) {
                    if (event.originalEvent.keyCode === 13) {
                        event.stopPropagation();
                    }
                });
                $('.nameColumn').click(function (event) {
                    event.stopPropagation();
                    console.log(event);
                });
            }
        );
    },
    addComponent: function (espId, componentTypeId) {
        $.get("?route=ajax&action=addComponent&esp=" + espId + "&type=" + componentTypeId,
            function (data, status) {
                var component = JSON.parse(data);
                component.name = component.name == null ? "" : component.name;

                switch (component.typeId) {
                    case 1:
                        $('#espRow' + component.espId + ' .devices').append('<img height="30" class="component' + component.id + '" src="img/temperature.png" />');
                        $('#espRow' + component.espId).next().find('tbody').append(
                            '<tr class="component' + component.id + '">' +
                            '<td><img height="30" src="img/temperature.png"></td>' +
                            '<td>' + component.name + '</td>' +
                            '<td class="deleteIcon" align="right"><img height="20" class="component' + component.id + '" src="img/delete.png" onclick="ConfigController.removeComponent(' + component.id + ')"/></td>' +
                            '</tr>'
                        );
                        break;
                    case 2:
                        $('#espRow' + component.espId + ' .devices').append('<img height="30" class="component' + component.id + '" src="img/switch.png" />');
                        $('#espRow' + component.espId).next().find('tbody').append(
                            '<tr class="component' + component.id + '">' +
                            '<td><img height="30" src="img/switch.png"></td>' +
                            '<td>' + component.name + '</td>' +
                            '<td class="deleteIcon" align="right"><img height="20" src="img/delete.png" onclick="ConfigController.removeComponent(' + component.id + ')"/></td>' +
                            '</tr>'
                        );
                        break;
                    case 3:
                        $('#espRow' + component.espId + ' .devices').append('<img height="30" class="component' + component.id + '" src="img/ledStrip.png" />');
                        $('#espRow' + component.espId).next().find('tbody').append(
                            '<tr class="component' + component.id + '">' +
                            '<td><img height="30" src="img/ledStrip.png"></td>' +
                            '<td>' + component.name + '</td>' +
                            '<td class="deleteIcon" align="right"><img height="20" src="img/delete.png" onclick="ConfigController.removeComponent(' + component.id + ')"/></td>' +
                            '</tr>'
                        );
                        break;
                }
            }
        );
    },
    removeComponent: function (componentId) {
        $.get("?route=ajax&action=removeComponent&id=" + componentId,
            function (data, status) {
                var component = JSON.parse(data);
                component.name = component.name == null ? "" : component.name;

                $('.component' + componentId).remove();
            });
    },
    addRowHandlers: function () {
        var rows = $('#configTable').find('.espRow');
        for (i = 0; i < rows.length; i++) {
            var currentRow = rows[i];
            var createClickHandler =
                function (row) {
                    return function () {
                        var cell = row.getElementsByTagName("td")[0];
                        var id = cell.innerHTML;
                        $("#configDetail" + id).toggle(400);
                    };
                };

            currentRow.onclick = createClickHandler(currentRow);
        }
    }
};