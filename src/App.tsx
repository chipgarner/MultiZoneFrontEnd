/** @jsxImportSource theme-ui */
import React, {useEffect, useState} from 'react';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import {MainChart} from "./MainChart";
import {LastNchart} from "./LastNchart"
import FastChart from "./FastChart";
import {Curvechart} from "./Curvechart"
import {StatusTable, tempRatesProps, initProps, initStatusProps} from "./StatusTable"
import {Controls} from "./Controls"
import {ThemeProvider, Grid, useColorMode} from 'theme-ui'
import {theme} from './TheTheme'
import {tempDataProps, thermocoupleDataProps, profileDataProps, profileNamesProps, statusProps} from './dataHandler'

//Use this if the browser server and python server are on the same machine.
let server: string = window.location.href  // The browser React server
server = server.split(":")[1]
server = server.split(":")[0]
console.log(server)
const WS_URL = 'ws:' + server + ':8081/status';

// Use this if the python server is running on a different machine than the browser React server.
// const WS_URL = 'ws://192.168.86.30:8081/status'; // The websocket server running in python

console.log(WS_URL)

let color_mode = 'light'

function App() {
    const {sendJsonMessage, readyState} = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log('WebSocket connection established.');
        },
        share: true,
        filter: () => false,
        retryOnError: true,
        shouldReconnect: () => true,
        onMessage: (event: WebSocketEventMap['message']) => processMessages(event)
    });

    useEffect(() => {
        if (readyState === ReadyState.OPEN) {
            sendJsonMessage({});
        }
    }, [sendJsonMessage, readyState]);

    const [status, setStatus] = useState<statusProps>(initStatusProps)
    const [zonesStatus, setZonesStatus] = useState<tempRatesProps>(initProps)

    const [thermocoupleDataZ1, setThermocoupleDataZ1] = useState<thermocoupleDataProps []>([]);
    const [thermocoupleDataZ2, setThermocoupleDataZ2] = useState<thermocoupleDataProps []>([]);
    const [thermocoupleDataZ3, setThermocoupleDataZ3] = useState<thermocoupleDataProps []>([]);
    const [thermocoupleDataZ4, setThermocoupleDataZ4] = useState<thermocoupleDataProps []>([]);

    const [smoothedZone1, setSmoothedZone1] = useState<tempDataProps>([]);
    const [smoothedZone2, setSmoothedZone2] = useState<tempDataProps>([]);
    const [smoothedZone3, setSmoothedZone3] = useState<tempDataProps>([]);
    const [smoothedZone4, setSmoothedZone4] = useState<tempDataProps>([]);

    const [curve1, setCurve1] = useState<profileDataProps>([]);
    const [curve2, setCurve2] = useState<profileDataProps>([]);
    const [curve3, setCurve3] = useState<profileDataProps>([]);

    const [profileData, setProfile] = useState<profileDataProps>([]);
    const [profileUpdate, updateProfile] = useState<profileDataProps>([]);
    const [profileNames, setProfileNames] = useState<profileNamesProps>([]);

    const processMessages = (event: { data: string; }) => {

        try {
            const response = JSON.parse(event.data);
            console.debug(response)
            if (response.thermocouple_data) {
                setThermocoupleDataZ1(thermocoupleDataZ1 =>
                    [...thermocoupleDataZ1, response.thermocouple_data[0]]);
                setThermocoupleDataZ2(thermocoupleDataZ2 =>
                    [...thermocoupleDataZ2, response.thermocouple_data[1]]);
                setThermocoupleDataZ3(thermocoupleDataZ3 =>
                    [...thermocoupleDataZ3, response.thermocouple_data[2]]);
                setThermocoupleDataZ4(thermocoupleDataZ4 =>
                    [...thermocoupleDataZ4, response.thermocouple_data[3]]);
            }
            if (response.profile) {
                setProfile(Profile => [Profile, ...response.profile.segments]);
            }
            if (response.profile_update) {
                updateProfile(ProfileUpdate => [ProfileUpdate, ...response.profile_update.segments]);
            }
            if (response.profile_names) {
                setProfileNames(ProfileNames => [ProfileNames, ...response.profile_names]);
                console.debug(profileNames)
            }

            if (response.status)
                setStatus(status => response.status)

            if (response.zones_status_array) {
                console.log(response)
                setZonesStatus(zonesStatus => response);

                if (response.zones_status_array[0].curve_data !== null) {
                    setCurve1(curve1 => [curve1, ...response.zones_status_array[0].curve_data])
                    // setCurve2(curve2 => [curve2, ...response.zones_status_array[1].curve_data])
                }
                setSmoothedZone1(smoothedZone1 => [...smoothedZone1, response.zones_status_array[0]]);
                setSmoothedZone2(smoothedZone2 => [...smoothedZone2, response.zones_status_array[1]]);
                setSmoothedZone3(smoothedZone3 => [...smoothedZone3, response.zones_status_array[2]]);
                setSmoothedZone4(smoothedZone4 => [...smoothedZone4, response.zones_status_array[3]]);
            }

        } catch (e) {
            console.warn("Not a JSON message (?) " + e);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            {Controls(status, profileUpdate, profileNames)}
            <Grid gap={1} columns={[1, 1, 2]} margin={1}>

                {StatusTable(status, zonesStatus)}
                <Grid gap={1} columns={[1, 2, 2]}>
                    {LastNchart(profileUpdate, smoothedZone1, smoothedZone2, smoothedZone3, smoothedZone4, GridFillColor(), -300)}
                    {LastNchart(profileUpdate, smoothedZone1, smoothedZone2, smoothedZone3, smoothedZone4, GridFillColor(), -15)}
                </Grid>
            </Grid>
            <Grid gap={1} columns={[1, 1, 2]} margin={1}>
                {MainChart(smoothedZone1, smoothedZone2, smoothedZone3, smoothedZone4, profileData, profileUpdate, GridFillColor())}
                <Grid gap={1} columns={[1, 2, 2]}>
                    {FastChart(thermocoupleDataZ1, smoothedZone1, 1, status.Manual, GridFillColor())}
                    {FastChart(thermocoupleDataZ2, smoothedZone2, 2, status.Manual, GridFillColor())}
                    {FastChart(thermocoupleDataZ3, smoothedZone3, 3, status.Manual, GridFillColor())}
                    {FastChart(thermocoupleDataZ4, smoothedZone4, 4, status.Manual, GridFillColor())}
                </Grid>
            </Grid>
            <ColorModeButton/>
            <Grid gap={1} columns={[1, 1, 1]}>
                {Curvechart(profileUpdate, curve1, curve2, curve3, smoothedZone1, smoothedZone2, smoothedZone3, smoothedZone4, GridFillColor(), -30)}
            </Grid>

        </ThemeProvider>
    );
}

function ColorModeButton() {
    const [mode, setMode] = useColorMode()
    color_mode = mode
    return (
        <button
            onClick={(e) => {
                const next = mode === 'dark' ? 'light' : 'dark'
                setMode(next)
            }}
        >Mode</button>
    )
}

function GridFillColor() {
    // Kludgeorama
    let mode = color_mode
    let chart_fill = 'gray'

    if (mode === 'light') {
        // @ts-ignore
        chart_fill = theme.colors.contrastbg
    }
    if (mode === 'dark') {
        // @ts-ignore
        chart_fill = theme.colors.modes.dark.contrastbg
    }
    return chart_fill.toString()
}

export default App;