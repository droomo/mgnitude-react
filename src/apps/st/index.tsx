import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from "react-router-dom"
import SceneShapeRadius from "./Scene/SceneShapeRadius";
import Experiment from "./Experiment";
import Login from "./Login";
import './style.css'

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/st/test/" element={<SceneShapeRadius done={() => {
            }}/>}/>
            <Route path="/st/" element={<Experiment/>}/>
            <Route path="/st/login" element={<Login/>}/>
        </Routes>
    </BrowserRouter>
);
