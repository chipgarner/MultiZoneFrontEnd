import {CartesianGrid,
    ComposedChart,
    Legend,
    Area,
    Bar,
    BarChart,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis} from "recharts";
import './MainChart.css';
import moment from "moment/moment";
import React from "react";

type tempDataProps = {
    time_ms: number;
    temperature: number;
    heat_factor: number;
}[];

function trimmed(tempData: tempDataProps) {
    const last = tempData.slice(-10)
    console.log('last length: ' + last.length)
    return last;
};
function FastChart(tempData: tempDataProps) {

    return (
        <div  className="small_wrap">
            <h3> Past 5 Minutes </h3>
            <ResponsiveContainer width ="99%" aspect={1.6} >
                <ComposedChart
                    data={trimmed(tempData)}
                    barCategoryGap={0}
                    margin={{ top: 20, right: 30, left: 30, bottom: 30 }} >
                    <CartesianGrid strokeDasharray="4" fill="white"/>
                    <XAxis dataKey="time_ms"
                           label={{ value: 'Time', position: 'bottom'}}
                           domain={["dataMin", "dataMax"]}
                           tickFormatter = {(unixTime) => moment(unixTime).format('HH:mm:ss Do')}
                           type="number"
                           includeHidden={true}/>
                    <YAxis yAxisId="left-axis"
                           label={{ value: 'Temperature',
                               angle: -90,
                               position: 'insideLeft' }}/>
                    <YAxis yAxisId="right-axis"
                           orientation="right"
                           label={{ value: 'Heat Factor',
                               angle: 90,
                               position: 'insideRight' }}/>
                    <Tooltip />yAxisId="right-axis" orientation="right"
                    <Legend verticalAlign="top" height={36}/>
                    <Bar yAxisId="right-axis"
                          orientation="right"
                          isAnimationActive={false}
                          dataKey="heat_factor"
                          stroke="rgba(30, 144, 255, 0.3)"
                          fill="rgba(30, 144, 255, 0.3)" />
                    <Line yAxisId="left-axis"
                          type="linear"
                          isAnimationActive={false}
                          strokeWidth={3}
                          dataKey="temperature"
                          stroke="#880000"
                          dot={false} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>

    );}

export default FastChart;