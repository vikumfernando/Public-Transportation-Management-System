import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminDashboard.css";

function AdminDashboard(){

    const [activeBuses, setActiveBuses] = useState(0);
    const [activeRoute, setActiveRoutes] = useState([]);
    const [issues, setIssues] = useState([]);
    const [totalRevenue, setRevenue] = useState("");

    useEffect(() => {

        //getting active bus count
        const activeBusCount = async () => {
            try {
                const res = await axios.get(`http://localhost:8070/Busses/getcount`);
                setActiveBuses(res.data.count); // assuming the API returns { count: number }
            } catch (error) {
                console.error("Failed to fetch active bus count:", error);
            }
        };

        //getting active route count
        const activeRouteCount = async () => {
           try{
            const res = await axios.get(`http://localhost:8070/Routes/getcount`);
            setActiveRoutes(res.data.count);
           }catch(err){
            console.error("Failed to fetch active route count : " + err);
           }
        };
        //implement the issue count function here

        //implement the total revenue function here

        activeBusCount();
        activeRouteCount();
    }, []);

    return (
            <div class="container">
                <div class="stat-card">
                    <div class="stat-title">Active Busses</div>
                    <div class="stat-number">{activeBuses}</div>
                </div> 

                <div class="stat-card">
                    <div class="stat-title">Active Routes</div>
                    <div class="stat-number">{activeRoute}</div>
                </div> 

                <div class="stat-card">
                    <div class="stat-title">Issues</div>
                    <div class="stat-number">1,234</div>
                </div> 

                <div class="stat-card">
                    <div class="stat-title">Total Revenue</div>
                    <div class="stat-number">1,234</div>
                </div> 

            </div>
    )
}

export default AdminDashboard;