<table id="configWifiTable">
    <thead>
        <tr>
            <th>SSID</th>
            <th>Mode</th>
            <th>Channel</th>
            <th>Rate</th>
            <th>Signal Strength</th>
            <th>Security</th>
            <th></th>
        </tr>
    </thead>
    <tbody id="configWifiTableBody">
    </tbody>
</table>
<div id="flash-dialog-confirm" title="Flash Esp" style="display:none;">
    <p>
        <span class="ui-icon ui-icon-info" style="float:left; margin:0px 12px 0px 0;"></span>
        This feature can be used to update the firmware running on an ESP.
    </p>
    <p>
        <h4>Selected Esp (HWID): <span id="flashSelectedEsp"></span></h4>
    </p>
    <p>
        <select id="firmwareDropDown">

        </select>
    </p>
</div>
<div id="updateWifiDialogConfirm" title="Update Wifi Credentials" style="display:none;">
    <p>
        <span class="ui-icon ui-icon-info" style="float:left; margin:0px 12px 0px 0;"></span>
        This feature can be used to update the WiFi credentials an esp uses.
    </p>
    <p>
        <h4>Selected Esp (HWID): <span id="updateWifiSelectedEsp"></span></h4>
    </p>
    <p>
        <div class="textboxUpdateWifi">
            <h4>SSID</h4>
            <input type="text">
        </div>
        <div class="textboxUpdateWifi">
            <h4>Password</h4>
            <input type="text">
        </div>
    </p>
</div>