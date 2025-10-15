import { useState, useEffect } from "react";
import axios from "axios";
import { api } from "../services/api";
import "../styles/AdminDashboard.css";

function AdminDashboard(){

    const [activeBuses, setActiveBuses] = useState(0);
    const [activeRoute, setActiveRoutes] = useState([]);
    const [issues, setIssues] = useState([]);
    const [totalRevenue, setRevenue] = useState(0);

    useEffect(() => {

        //getting active bus count
        const activeBusCount = async () => {
            try {
                const res = await axios.get(`http://localhost:8070/Busses/getcount`);
                setActiveBuses(res.data.count);
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
        const getTotalRevenue = async () => {
            try {
                const revenueData = await api.getOverallRevenue('daily');
                setRevenue(revenueData.totalAmount || 0);
            } catch (error) {
                console.error("Failed to fetch total revenue:", error);
            }
        };

        activeBusCount();
        activeRouteCount();
        getTotalRevenue();
    }, []);

    return (
        <div className="container">
            <div className="stat-card">
                <div className="stat-title">Active Busses</div>
                <div className="stat-number">{activeBuses}</div>
            </div> 

            <div className="stat-card">
                <div className="stat-title">Active Routes</div>
                <div className="stat-number">{activeRoute}</div>
            </div> 

            <div className="stat-card">
                <div className="stat-title">Issues</div>
                <div className="stat-number">1,234</div>
            </div> 

            <div className="stat-card">
                <div className="stat-title">Total Revenue</div>
                <div className="stat-number">Rs. {totalRevenue.toFixed(2)}</div>
            </div> 
        </div>
    )
}

export default AdminDashboard;