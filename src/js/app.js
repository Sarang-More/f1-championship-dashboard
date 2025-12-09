/**
 * F1 DASHBOARD APPLICATION - ENHANCED
 * Main controller with search, filters, and complete Analysis tab
 */

const App = {
    // State
    currentSeason: 2024,
    currentTab: 'overview',
    isLoaded: false,
    searchTimeout: null,

    /**
     * Initialize the application
     */
    async init() {
        console.log('🏎️ F1 Dashboard Initializing...');

        // Initialize visualizations module
        Visualizations.init();

        // Load data
        const success = await DataLoader.loadAll((status) => {
            document.querySelector('.loader-status').textContent = status;
        });

        if (!success) {
            console.error('Failed to load data');
            return;
        }

        // Setup UI
        this.setupSeasonSelector();
        this.setupTabs();
        this.setupEventListeners();
        this.setupSearch();

        // Initial render
        await this.render();

        // Hide loader, show app
        this.showApp();

        console.log('✅ F1 Dashboard Ready!');
    },

    /**
     * Setup season selector
     */
    setupSeasonSelector() {
        const select = document.getElementById('season-select');
        const seasons = DataLoader.getSeasons();

        // Find latest season with data
        this.currentSeason = seasons[0] || 2024;

        select.innerHTML = '';
        seasons.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });

        select.value = this.currentSeason;

        select.addEventListener('change', (e) => {
            this.currentSeason = parseInt(e.target.value);
            this.render();
        });

        // Also populate matrix season selector
        const matrixSelect = document.getElementById('matrix-season');
        if (matrixSelect) {
            matrixSelect.innerHTML = '';
            seasons.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                matrixSelect.appendChild(option);
            });
            matrixSelect.value = this.currentSeason;
            matrixSelect.addEventListener('change', (e) => {
                this.currentSeason = parseInt(e.target.value);
                this.renderAnalysisTab();
            });
        }
    },

    /**
     * Setup tab navigation
     */
    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const panels = document.querySelectorAll('.tab-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                // Update active states
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                panels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === `panel-${targetTab}`) {
                        panel.classList.add('active');
                    }
                });

                this.currentTab = targetTab;
                
                // Render tab content (with slight delay for animation)
                setTimeout(() => {
                    this.renderTab(targetTab);
                }, 50);
            });
        });
    },

    /**
     * Setup search functionality
     */
    setupSearch() {
        const searchInput = document.getElementById('driver-search');
        const eraSelect = document.getElementById('driver-era');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.filterDrivers(e.target.value, eraSelect?.value || 'all');
                }, 300);
            });
        }

        if (eraSelect) {
            eraSelect.addEventListener('change', (e) => {
                this.filterDrivers(searchInput?.value || '', e.target.value);
            });
        }
    },

    /**
     * Filter drivers based on search and era
     */
    filterDrivers(searchTerm, era) {
        const driverStats = DataLoader.getAllTimeStats('races');
        
        let filtered = driverStats;

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(d => 
                d.name.toLowerCase().includes(term)
            );
        }

        // Filter by era
        if (era && era !== 'all') {
            const [startYear, endYear] = era.split('-').map(Number);
            
            filtered = filtered.filter(d => {
                // Check if driver raced in this era
                const driverResults = DataLoader.data.results.filter(r => r.driverId === d.driverId);
                return driverResults.some(r => {
                    const race = DataLoader.maps.races.get(r.raceId);
                    return race && race.year >= startYear && race.year <= endYear;
                });
            });
        }

        // Update the leaderboard with filtered data
        const activeMetric = document.querySelector('.control-btn[data-metric].active')?.dataset.metric || 'wins';
        filtered.sort((a, b) => b[activeMetric] - a[activeMetric]);
        
        Visualizations.drawLeaderboardChart('leaderboard-chart', filtered.slice(0, 15), activeMetric);

        // Show message if no results
        if (filtered.length === 0) {
            const container = d3.select('#leaderboard-chart');
            container.selectAll('*').remove();
            container.append('div')
                .style('text-align', 'center')
                .style('padding', '60px')
                .style('color', '#52526A')
                .html(`No drivers found matching "<strong>${searchTerm}</strong>"${era !== 'all' ? ' in selected era' : ''}`);
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Championship chart toggle
        document.querySelectorAll('#panel-overview .control-btn[data-chart]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#panel-overview .control-btn[data-chart]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderChampionshipChart(btn.dataset.chart);
            });
        });

        // Leaderboard metric toggle
        document.querySelectorAll('.control-btn[data-metric]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.control-btn[data-metric]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const searchTerm = document.getElementById('driver-search')?.value || '';
                const era = document.getElementById('driver-era')?.value || 'all';
                
                if (searchTerm || era !== 'all') {
                    this.filterDrivers(searchTerm, era);
                } else {
                    this.renderLeaderboard(btn.dataset.metric);
                }
            });
        });

        // Driver comparison
        this.setupDriverComparison();

        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.renderTab(this.currentTab);
            }, 300);
        });
    },

    /**
     * Setup driver comparison controls
     */
    setupDriverComparison() {
        const driver1Select = document.getElementById('driver1-select');
        const driver2Select = document.getElementById('driver2-select');
        const compareBtn = document.getElementById('compare-btn');

        if (!driver1Select || !driver2Select) return;

        // Populate driver selects with ALL drivers (sorted by races/wins)
        const driverStats = DataLoader.getAllTimeStats('wins');
        
        driver1Select.innerHTML = '<option value="">Select Driver 1</option>';
        driver2Select.innerHTML = '<option value="">Select Driver 2</option>';
        
        // Add ALL drivers, no slicing
        driverStats.forEach(driver => {
            const winsText = driver.wins > 0 ? `${driver.wins} wins` : `${driver.races} races`;
            
            const opt1 = document.createElement('option');
            opt1.value = driver.driverId;
            opt1.textContent = `${driver.name} (${winsText})`;
            driver1Select.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = driver.driverId;
            opt2.textContent = `${driver.name} (${winsText})`;
            driver2Select.appendChild(opt2);
        });

        compareBtn.addEventListener('click', () => {
            const driver1Id = parseInt(driver1Select.value);
            const driver2Id = parseInt(driver2Select.value);

            if (!driver1Id || !driver2Id) {
                alert('Please select both drivers to compare');
                return;
            }

            if (driver1Id === driver2Id) {
                alert('Please select different drivers');
                return;
            }

            const stats1 = DataLoader.getDriverCareerStats(driver1Id);
            const stats2 = DataLoader.getDriverCareerStats(driver2Id);
            Visualizations.drawDriverComparison('driver-comparison', stats1, stats2);
        });
    },

    /**
     * Main render function
     */
    async render() {
        // Update quick stats
        this.updateQuickStats();

        // Render current tab
        this.renderTab(this.currentTab);
    },

    /**
     * Render specific tab
     */
    renderTab(tab) {
        switch(tab) {
            case 'overview':
                this.renderOverviewTab();
                break;
            case 'drivers':
                this.renderDriversTab();
                break;
            case 'teams':
                this.renderTeamsTab();
                break;
            case 'circuits':
                this.renderCircuitsTab();
                break;
            case 'analysis':
                this.renderAnalysisTab();
                break;
        }
    },

    /**
     * Update quick stats in header
     */
    updateQuickStats() {
        const stats = DataLoader.getGlobalStats();
        const seasonRaces = DataLoader.getRacesBySeason(this.currentSeason);

        document.getElementById('qs-races').textContent = seasonRaces.length;
        
        const seasonDrivers = new Set();
        seasonRaces.forEach(race => {
            DataLoader.data.results
                .filter(r => r.raceId === race.raceId)
                .forEach(r => seasonDrivers.add(r.driverId));
        });
        document.getElementById('qs-drivers').textContent = seasonDrivers.size;
    },

    /**
     * Render Overview tab
     */
    renderOverviewTab() {
        const stats = DataLoader.getGlobalStats();

        // Update stat numbers with animation
        this.animateNumber('stat-races', stats.totalRaces);
        this.animateNumber('stat-drivers', stats.totalDrivers);
        this.animateNumber('stat-teams', stats.totalConstructors);
        this.animateNumber('stat-circuits', stats.totalCircuits);

        // Animate stat rings
        Visualizations.animateStatRings(stats);

        // Championship chart
        this.renderChampionshipChart('drivers');

        // Winners donut
        const winners = DataLoader.getRaceWinners(this.currentSeason);
        Visualizations.drawWinnersChart('winners-chart', winners);

        // Points distribution
        const standings = DataLoader.getDriverStandings(this.currentSeason);
        Visualizations.drawPointsChart('points-chart', standings);
    },

    /**
     * Render championship chart
     */
    renderChampionshipChart(type) {
        const data = DataLoader.getChampionshipProgression(this.currentSeason, type);
        Visualizations.drawChampionshipChart('championship-chart', data, type);
    },

    /**
     * Render Drivers tab
     */
    renderDriversTab() {
        // Clear search
        const searchInput = document.getElementById('driver-search');
        const eraSelect = document.getElementById('driver-era');
        
        if (searchInput) searchInput.value = '';
        if (eraSelect) eraSelect.value = 'all';

        // Leaderboard
        this.renderLeaderboard('wins');

        // Initial comparison placeholder
        Visualizations.drawDriverComparison('driver-comparison', null, null);
    },

    /**
     * Render leaderboard
     */
    renderLeaderboard(metric) {
        const data = DataLoader.getAllTimeStats(metric);
        Visualizations.drawLeaderboardChart('leaderboard-chart', data, metric);
    },

    /**
     * Render Teams tab
     */
    renderTeamsTab() {
        // Constructor dominance
        const dominance = DataLoader.getConstructorDominance();
        Visualizations.drawDominanceChart('dominance-chart', dominance);

        // Team standings
        const standings = DataLoader.getConstructorStandings(this.currentSeason);
        Visualizations.drawTeamStandings('team-standings', standings);
    },

    /**
     * Render Circuits tab
     */
    renderCircuitsTab() {
        const circuits = DataLoader.getCircuitStats();
        
        // World map
        Visualizations.drawWorldMap('world-map', circuits);

        // Most races chart
        const topCircuits = circuits
            .sort((a, b) => b.totalRaces - a.totalRaces)
            .slice(0, 10);
        
        this.drawCircuitsBarChart('circuits-races-chart', topCircuits);

        // Circuit winners
        this.drawCircuitWinnersChart('circuit-winners', circuits);
    },

    /**
     * Draw circuits bar chart
     */
    drawCircuitsBarChart(containerId, data) {
        const container = d3.select(`#${containerId}`);
        container.selectAll('*').remove();

        const rect = container.node().getBoundingClientRect();
        const margin = { top: 20, right: 30, bottom: 100, left: 50 };
        const width = rect.width - margin.left - margin.right;
        const height = 320 - margin.top - margin.bottom;

        const svg = container.append('svg')
            .attr('width', rect.width)
            .attr('height', 320)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, width])
            .padding(0.25);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.totalRaces) * 1.1])
            .range([height, 0]);

        // Grid
        svg.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''))
            .style('opacity', 0.2);

        // Bars
        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.name))
            .attr('y', height)
            .attr('width', xScale.bandwidth())
            .attr('height', 0)
            .attr('fill', '#E10600')
            .attr('rx', 4)
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                d3.select(event.target)
                    .attr('fill', '#FF4444')
                    .style('filter', 'drop-shadow(0 0 10px rgba(225, 6, 0, 0.5))');
                
                Visualizations.showTooltip(event, `
                    <div class="tooltip-title">${d.name}</div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Location</span>
                        <span class="tooltip-value">${d.location}, ${d.country}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Races Hosted</span>
                        <span class="tooltip-value" style="color: #FFD700; font-size: 1.2em">${d.totalRaces}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Unique Winners</span>
                        <span class="tooltip-value">${d.uniqueWinners}</span>
                    </div>
                `);
            })
            .on('mouseout', (event) => {
                d3.select(event.target)
                    .attr('fill', '#E10600')
                    .style('filter', 'none');
                Visualizations.hideTooltip();
            })
            .transition()
            .duration(800)
            .delay((d, i) => i * 60)
            .attr('y', d => yScale(d.totalRaces))
            .attr('height', d => height - yScale(d.totalRaces));

        // Value labels on bars
        svg.selectAll('.bar-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'bar-label')
            .attr('x', d => xScale(d.name) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d.totalRaces) - 8)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-family', 'Orbitron')
            .attr('font-size', '12px')
            .attr('font-weight', '700')
            .text(d => d.totalRaces)
            .attr('opacity', 0)
            .transition()
            .delay((d, i) => 800 + i * 60)
            .duration(300)
            .attr('opacity', 1);

        // X Axis
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end')
            .attr('dx', '-0.5em')
            .attr('dy', '0.5em')
            .attr('font-size', '10px')
            .attr('fill', '#888');

        // Y Axis
        svg.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(yScale).ticks(5));
    },

    /**
     * Draw circuit winners chart
     */
    drawCircuitWinnersChart(containerId, circuits) {
        const container = d3.select(`#${containerId}`);
        container.selectAll('*').remove();

        // Get top circuits by unique winners
        const topCircuits = circuits
            .filter(c => c.mostWins)
            .sort((a, b) => b.uniqueWinners - a.uniqueWinners)
            .slice(0, 8);

        if (topCircuits.length === 0) {
            container.append('div')
                .style('text-align', 'center')
                .style('padding', '60px')
                .style('color', '#52526A')
                .text('No circuit winner data available');
            return;
        }

        topCircuits.forEach((circuit, i) => {
            const item = container.append('div')
                .style('display', 'flex')
                .style('justify-content', 'space-between')
                .style('align-items', 'center')
                .style('padding', '12px 15px')
                .style('margin-bottom', '8px')
                .style('background', 'rgba(255,255,255,0.03)')
                .style('border-radius', '8px')
                .style('border-left', '3px solid #E10600')
                .style('cursor', 'pointer')
                .style('transition', 'all 0.3s ease')
                .style('opacity', '0')
                .style('transform', 'translateX(-20px)');

            item.append('div')
                .html(`
                    <div style="font-weight: 600; color: #fff; font-size: 0.95rem">${circuit.name}</div>
                    <div style="font-size: 0.8rem; color: #888">${circuit.mostWins.name}</div>
                `);

            item.append('div')
                .style('text-align', 'right')
                .html(`
                    <div style="font-family: Orbitron; font-size: 1.2rem; color: #FFD700">${circuit.mostWins.wins}</div>
                    <div style="font-size: 0.7rem; color: #888">wins</div>
                `);

            // Hover effect
            item.on('mouseover', function() {
                d3.select(this)
                    .style('background', 'rgba(225, 6, 0, 0.1)')
                    .style('border-left-color', '#FFD700');
            }).on('mouseout', function() {
                d3.select(this)
                    .style('background', 'rgba(255,255,255,0.03)')
                    .style('border-left-color', '#E10600');
            });

            // Animate in
            item.transition()
                .delay(i * 100)
                .duration(400)
                .style('opacity', '1')
                .style('transform', 'translateX(0)');
        });
    },

    /**
     * Render Analysis tab - FULL IMPLEMENTATION
     */
    renderAnalysisTab() {
        // Get season data
        const races = DataLoader.getRacesBySeason(this.currentSeason);
        
        if (races.length === 0) {
            d3.select('#results-matrix').html(`
                <div style="text-align: center; padding: 60px; color: #52526A">
                    No race data available for ${this.currentSeason}
                </div>
            `);
            return;
        }

        // Prepare results matrix data
        const raceIds = races.map(r => r.raceId);
        const seasonResults = DataLoader.data.results.filter(r => raceIds.includes(r.raceId));
        
        // Get unique drivers for this season
        const driverIds = [...new Set(seasonResults.map(r => r.driverId))];
        const drivers = driverIds.map(id => {
            const driver = DataLoader.maps.drivers.get(id);
            const totalPoints = seasonResults
                .filter(r => r.driverId === id)
                .reduce((sum, r) => sum + r.points, 0);
            return {
                id,
                name: driver?.fullName || 'Unknown',
                points: totalPoints
            };
        }).sort((a, b) => b.points - a.points).slice(0, 20);

        // Prepare results data for matrix
        const matrixResults = seasonResults.map(r => {
            const race = DataLoader.maps.races.get(r.raceId);
            return {
                driverId: r.driverId,
                round: race?.round,
                position: r.position,
                points: r.points
            };
        });

        // Draw Results Matrix
        Visualizations.drawResultsMatrix('results-matrix', races, matrixResults, drivers);

        // Draw Pit Stop Analysis
        const seasonPitStops = DataLoader.data.pitStops.filter(p => raceIds.includes(p.raceId));
        Visualizations.drawPitStopChart('pitstop-chart', seasonPitStops, DataLoader.maps.drivers);
    },

    /**
     * Animate number counting
     */
    animateNumber(elementId, target) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * eased);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    },

    /**
     * Show app after loading
     */
    showApp() {
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('app').classList.add('loaded');
        this.isLoaded = true;
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export
window.App = App;