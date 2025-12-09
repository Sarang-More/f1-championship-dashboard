# 🏎️ F1 Championship Analytics Dashboard

[![Deployed on Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://tiny-cassata-a8fd41.netlify.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-E10600?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![D3.js](https://img.shields.io/badge/D3.js-v7-F9A03C?style=for-the-badge&logo=d3.js&logoColor=white)](https://d3js.org/)

An interactive data visualization dashboard for exploring Formula 1 racing history from 1950 to present. Built with vanilla JavaScript and D3.js, this project provides comprehensive insights into drivers, constructors, circuits, and race performance across seven decades of F1 racing.

### 🔗 [Live Demo](https://tiny-cassata-a8fd41.netlify.app)

![F1 Dashboard Preview](src/assets/f1-logo.png)

## 🎯 Project Overview

This dashboard was developed as a **Data Visualization course project** at Indiana University Luddy School of Informatics, Computing, and Engineering. It demonstrates advanced data visualization techniques using real-world Formula 1 historical data.

### Key Features

- **📊 Interactive Visualizations**: Line charts, pie charts, bar charts, heatmaps, scatter plots, and world maps
- **🗺️ Global Circuit Map**: Interactive world map showing all F1 circuits with race statistics
- **👤 Driver Analytics**: Championship progression, career statistics, and driver comparisons
- **🏢 Constructor Analysis**: Team dominance trends, constructor standings, and historical performance
- **⏱️ Pit Stop Analysis**: Scatter plot visualization of pit stop performance across races
- **📈 Race Results Matrix**: Heatmap showing driver finishing positions across seasons
- **🔍 Search & Filter**: Real-time driver search with era-based filtering
- **📱 Responsive Design**: Optimized for desktop and tablet viewing

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic markup and structure |
| **CSS3** | Styling, animations, and responsive design |
| **JavaScript (ES6+)** | Application logic and interactivity |
| **D3.js v7** | Data-driven visualizations |
| **TopoJSON** | World map geographic data |

## 📁 Project Structure

```
f1-championship-dashboard/
├── src/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── styles.css      # All styling (F1 theme)
│   ├── js/
│   │   ├── app.js          # Main application logic
│   │   ├── data-loader.js  # Data loading and processing
│   │   └── visualizations.js # D3.js visualization functions
│   ├── assets/
│   │   ├── f1-logo.png     # F1 logo
│   │   └── f1-logo.svg     # F1 logo (SVG version)
│   └── data/
│       ├── circuits.csv
│       ├── constructors.csv
│       ├── constructor_results.csv
│       ├── constructor_standings.csv
│       ├── drivers.csv
│       ├── driver_standings.csv
│       ├── lap_times.csv
│       ├── pit_stops.csv
│       ├── qualifying.csv
│       ├── races.csv
│       ├── results.csv
│       ├── seasons.csv
│       ├── sprint_results.csv
│       └── status.csv
├── README.md
├── .gitignore
├── netlify.toml
└── LICENSE
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Git installed on your machine

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sarang-More/f1-championship-dashboard.git
   cd f1-championship-dashboard
   ```

2. **Start a local server**

   Using Python 3:
   ```bash
   cd src
   python -m http.server 8000
   ```

   Using Node.js (with `http-server`):
   ```bash
   npx http-server src -p 8000
   ```

   Using VS Code:
   - Install the "Live Server" extension
   - Right-click on `src/index.html` and select "Open with Live Server"

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🌐 Deployment

### Netlify Deployment

This project is configured for easy deployment on Netlify:

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub account and select this repository
5. Configure build settings:
   - **Base directory**: (leave empty)
   - **Publish directory**: `src`
6. Click "Deploy site"

The included `netlify.toml` handles the configuration automatically.

## 📊 Visualizations

### Overview Tab
- **Animated Statistics Rings**: Total races, drivers, constructors, and circuits
- **Championship Progression**: Line chart showing points accumulation throughout a season
- **Race Winners Distribution**: Donut chart of race wins by driver
- **Points Distribution**: Bar chart comparing top drivers' points

### Drivers Tab
- **Driver Leaderboard**: Top 15 drivers by all-time points
- **Driver Comparison Tool**: Side-by-side comparison of two drivers
- **Search Functionality**: Find any driver from F1 history with era filtering

### Teams Tab
- **Constructor Dominance**: Stacked area chart showing team performance over eras
- **Current Standings**: Bar chart of constructor championship standings

### Circuits Tab
- **Interactive World Map**: Click on circuits to view race history
- **Most Races Hosted**: Horizontal bar chart of circuits by race count
- **Circuit Details**: Tooltips with country, location, and statistics

### Analysis Tab
- **Race Results Matrix**: Heatmap of driver finishing positions
- **Pit Stop Performance**: Scatter plot analyzing pit stop times vs. lap numbers

## 🎨 Design System

The dashboard follows the official **Formula 1 brand guidelines**:

- **Primary Colors**:
  - F1 Red: `#E10600`
  - Carbon Black: `#15151E`
  - Pure White: `#FFFFFF`

- **Typography**:
  - Display: Orbitron (headings)
  - Body: Exo 2, Rajdhani (content)

- **UI Elements**:
  - Skewed elements for dynamic feel
  - Red accent highlights
  - Dark theme for immersive experience

## 📈 Data Source

The F1 historical data is sourced from the [Ergast Developer API](http://ergast.com/mrd/) database, which provides comprehensive Formula 1 data from 1950 to present including:

- Race results and standings
- Driver and constructor information
- Circuit details and locations
- Lap times and pit stop data
- Qualifying results

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ergast Developer API](http://ergast.com/mrd/) for the comprehensive F1 dataset
- [D3.js](https://d3js.org/) for the powerful visualization library
- [Formula 1](https://www.formula1.com/) for brand inspiration
- Indiana University Luddy School for the educational opportunity

## 👤 Author

**Sarang More**

- GitHub: [@Sarang-More](https://github.com/Sarang-More)
- Course: Data Visualization
- Institution: Indiana University Luddy School of Informatics, Computing, and Engineering

---

<p align="center">
  <i>"If you no longer go for a gap that exists, you are no longer a racing driver."</i><br>
  — Ayrton Senna
</p>

<p align="center">
  🏁 <b>Lights out and away we go!</b> 🏁
</p>
