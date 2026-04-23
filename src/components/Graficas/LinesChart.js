import { Line } from 'react-chartjs-2'; 
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tittle,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.registrer(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tittle,
    Tooltip,
    Legend,
    Filler,
);