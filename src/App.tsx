/** @jsxImportSource theme-ui */
import React, {useEffect, useState} from 'react';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import {MainChart, tempSmoothedProps} from "./MainChart";
import FastChart from "./FastChart";
import {AllPointsChart, tempDataZonesProps} from "./AllPointsChart"
import labelledNumber from "./labelledeNumber"
import {StatusTable, tempRatesProps, initProps}  from "./StatusTable"
import {ThemeProvider, Grid, Box, Button, Container} from 'theme-ui'
import {handleClickStop, handleClickStart} from "./BackendCalls"
import {theme} from './TheTheme'

// Example:  const WS_URL = 'ws://127.0.0.1:8081/status';
// This is needed if the server is running on a different machine than the browser.
let server: string = window.location.href
server = server.split(":")[1]
server = server.split(":")[0]
console.log(server)
const WS_URL = 'ws:' + server + ':8081/status';
// const WS_URL = 'ws://172.20.10.9:8081/status';
console.log(WS_URL)

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
        console.log('In useEffect');
        if (readyState === ReadyState.OPEN) {
            sendJsonMessage({});
        }
    }, [sendJsonMessage, readyState]);

    const [state, setStatus] = useState<tempRatesProps>(initProps)
    const [tempDataZones, setTempDataZones] = useState<
        tempDataZonesProps>({"Zone 1": [], Zone2: [], Zone3: []});

    const [tempData, setTempData] = useState<
        { time_ms: number, temperature: number, heat_factor: number }[]>([]);
    const [tempDataZ2, setTempDataZ2] = useState<
        { time_ms: number, temperature: number, heat_factor: number }[]>([]);
    const [smoothedTempData, setSmoothedTempData] = useState<
        tempSmoothedProps>([]);
    const [profileData, setProfile] = useState<
        { time_ms: number, temperature: number }[]>([]);

    const processMessages = (event: { data: string; }) => {
        try {
            const response = JSON.parse(event.data);
            console.debug(response);
            if (response.profile) {
                console.log('Incoming profile: ' + response.profile);
                console.log('Incoming segments: ' + response.profile.segments);
                setProfile(Profile => [...Profile, ...response.profile.segments]);
            }
            if (response.state) {
                setStatus(state => response)

                setTempData(tempData => [...tempData, ...response.t_t_h_z_all["Zone 1"]]);
                setTempDataZones(tempDataZones => response.t_t_h_z_all);
                setTempDataZ2(tempDataZ2 => [...tempDataZ2, ...response.t_t_h_z_all.Zone2]);
                setSmoothedTempData(smoothedTempData => [...smoothedTempData, response.zone_status["Zone 1"]]);
            }
        } catch (e) {
            console.warn("Not a JSON message " + e);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <div>
                {StatusTable(state)}
            </div>
            <Button onClick={handleClickStart}>Start</Button>
            <Button onClick={handleClickStop}>Stop</Button>

            <Grid gap={2} columns={[1, 1, 2]}>

                {MainChart(smoothedTempData, profileData)}
                <Grid gap={2} columns={[1, 2, 2]}>
                    <Box bg="primary">
                        primary
                    </Box>
                    {AllPointsChart(tempData, tempDataZ2, tempDataZones)}
                    {FastChart(tempData, tempDataZ2)}

                    <Box bg="muted">
                        muted
                    </Box>
                </Grid>
                <Box bg="background">background</Box>
            </Grid>
        </ThemeProvider>
    );
}

export default App;