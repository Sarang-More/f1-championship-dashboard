/**
 * F1 VISUALIZATIONS MODULE - ENHANCED VERSION
 * Stunning D3.js charts with rich tooltips and interactions
 */

const Visualizations = {
    // Common settings
    margin: { top: 40, right: 30, bottom: 50, left: 60 },
    colors: [
        '#E10600', '#00D2BE', '#0600EF', '#FF8700', '#006F62',
        '#005AFF', '#900000', '#2B4562', '#FFD700', '#F596C8',
        '#00FF88', '#FF00FF', '#00FFFF', '#FFFF00', '#FF6B6B'
    ],
    
    // Team colors mapping
    teamColors: {
        'Ferrari': '#DC0000',
        'Mercedes': '#00D2BE',
        'Red Bull': '#0600EF',
        'McLaren': '#FF8700',
        'Aston Martin': '#006F62',
        'Alpine F1 Team': '#0090FF',
        'Williams': '#005AFF',
        'AlphaTauri': '#2B4562',
        'Alfa Romeo': '#900000',
        'Haas F1 Team': '#FFFFFF'
    },
    
    // Tooltip element
    tooltip: null,

    /**
     * Initialize
     */
    init() {
        this.tooltip = d3.select('#tooltip');
    },

    /**
     * Show tooltip with rich content - VIEWPORT AWARE
     */
    showTooltip(event, content) {
        const tooltip = this.tooltip;
        
        // First render hidden to measure dimensions
        tooltip
            .html(content)
            .style('visibility', 'hidden')
            .style('display', 'block')
            .classed('active', true);
        
        // Get tooltip dimensions
        const tooltipNode = tooltip.node();
        const tooltipWidth = tooltipNode.offsetWidth;
        const tooltipHeight = tooltipNode.offsetHeight;
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate position - default to right and below cursor
        let left = event.pageX + 15;
        let top = event.pageY + 15;
        
        // Check right boundary - if tooltip goes off right, show on left of cursor
        if (left + tooltipWidth > viewportWidth - 20) {
            left = event.pageX - tooltipWidth - 15;
        }
        
        // Check left boundary
        if (left < 20) {
            left = 20;
        }
        
        // Check bottom boundary - if tooltip goes off bottom, show above cursor
        if (top + tooltipHeight > viewportHeight + window.scrollY - 20) {
            top = event.pageY - tooltipHeight - 15;
        }
        
        // Check top boundary
        if (top < window.scrollY + 20) {
            top = window.scrollY + 20;
        }
        
        // Apply final position
        tooltip
            .style('left', left + 'px')
            .style('top', top + 'px')
            .style('visibility', 'visible');
    },

    /**
     * Hide tooltip
     */
    hideTooltip() {
        this.tooltip.classed('active', false);
    },

    /**
     * CHAMPIONSHIP PROGRESSION CHART - ENHANCED
     */
    drawChampionshipChart(containerId, data, type = 'drivers') {
        const container = d3.select(`#${containerId}`);
        container.selectAll('*').remove();

        if (!data || data.length === 0) {
            container.append('div')
                .attr('class', 'no-data')
                .style('text-align', 'center')
                .style('padding', '60px')
                .style('color', '#52526A')
                .text('No championship data available for this season');
            return;
        }

        const rect = container.node().getBoundingClientRect();
        const width = rect.width - this.margin.left - this.margin.right;
        const height = 350 - this.margin.top - this.margin.bottom;

        const svg = container.append('svg')
            .attr('width', rect.width)
            .attr('height', 350)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Scales
        const maxRounds = d3.max(data, d => d.points.length);
        const maxPoints = d3.max(data, d => d3.max(d.points, p => p.points));

        const xScale = d3.scaleLinear()
            .domain([1, maxRounds])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, maxPoints * 1.1])
            .range([height, 0]);

        // Grid
        svg.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat('')
            );

        // Axes
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(Math.min(maxRounds, 24)).tickFormat(d => `R${d}`));

        svg.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(yScale));

        // Axis labels
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .attr('fill', '#888')
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('RACE ROUND');

        svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -45)
            .attr('fill', '#888')
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('CHAMPIONSHIP POINTS');

        // Line generator
        const line = d3.line()
            .x(d => xScale(d.round))
            .y(d => yScale(d.points))
            .curve(d3.curveMonotoneX);

        // Draw lines for each entity
        const entities = svg.selectAll('.entity-group')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'entity-group');

        // Lines with animation
        entities.append('path')
            .attr('class', 'chart-line')
            .attr('d', d => line(d.points))
            .attr('stroke', (d, i) => this.colors[i % this.colors.length])
            .attr('stroke-width', 3)
            .attr('fill', 'none')
            .style('filter', 'drop-shadow(0 0 3px rgba(255,255,255,0.3))')
            .attr('stroke-dasharray', function() {
                return this.getTotalLength();
            })
            .attr('stroke-dashoffset', function() {
                return this.getTotalLength();
            })
            .transition()
            .duration(2000)
            .ease(d3.easeQuadOut)
            .attr('stroke-dashoffset', 0);

        // Points with enhanced tooltips
        entities.each((entityData, entityIndex, nodes) => {
            const group = d3.select(nodes[entityIndex]);
            const color = this.colors[entityIndex % this.colors.length];
            
            group.selectAll('.chart-dot')
                .data(entityData.points)
                .enter()
                .append('circle')
                .attr('class', 'chart-dot')
                .attr('cx', d => xScale(d.round))
                .attr('cy', d => yScale(d.points))
                .attr('r', 0)
                .attr('fill', color)
                .attr('stroke', '#15151E')
                .attr('stroke-width', 2)
                .style('cursor', 'pointer')
                .on('mouseover', (event, d) => {
                    d3.select(event.target)
                        .transition()
                        .duration(200)
                        .attr('r', 10)
                        .style('filter', `drop-shadow(0 0 10px ${color})`);
                    
                    // Find position at this round
                    const position = entityIndex + 1;
                    const pointsGained = d.round > 1 ? 
                        d.points - entityData.points[d.round - 2]?.points || 0 : d.points;
                    
                    this.showTooltip(event, `
                        <div class="tooltip-title" style="color: ${color}">${entityData.name}</div>
                        <div class="tooltip-row">
                            <span class="tooltip-label">Race</span>
                            <span class="tooltip-value">${d.raceName}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-label">Round</span>
                            <span class="tooltip-value">${d.round} of ${maxRounds}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-label">Total Points</span>
                            <span class="tooltip-value" style="color: ${color}; font-size: 1.2em">${d.points}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-label">Points This Race</span>
                            <span class="tooltip-value">${pointsGained >= 0 ? '+' : ''}${pointsGained}</span>
                        </div>
                    `);
                })
                .on('mouseout', (event) => {
                    d3.select(event.target)
                        .transition()
                        .duration(200)
                        .attr('r', 5)
                        .style('filter', 'none');
                    this.hideTooltip();
                })
                .transition()
                .delay((d, i) => i * 80)
                .duration(300)
                .attr('r', 5);
        });

        // Enhanced Legend
        this.drawEnhancedLegend(container, data.slice(0, 8), 'championship');
    },

    /**
     * Enhanced Legend with interactivity
     */
    drawEnhancedLegend(container, data, chartType) {
        const legend = container.append('div')
            .attr('class', 'chart-legend')
            .style('margin-top', '20px');

        data.forEach((d, i) => {
            const color = this.colors[i % this.colors.length];
            const item = legend.append('div')
                .attr('class', 'legend-item')
                .style('display', 'inline-flex')
                .style('align-items', 'center')
                .style('gap', '8px')
                .style('padding', '6px 12px')
                .style('margin', '4px')
                .style('background', 'rgba(255,255,255,0.05)')
                .style('border-radius', '20px')
                .style('border', `2px solid ${color}`)
                .style('cursor', 'pointer')
                .style('transition', 'all 0.3s ease');

            item.append('div')
                .style('width', '12px')
                .style('height', '12px')
                .style('border-radius', '50%')
                .style('background', color)
                .style('box-shadow', `0 0 8px ${color}`);

            item.append('span')
                .style('font-size', '0.85rem')
                .style('color', '#fff')
                .style('font-weight', '600')
                .text(d.name);

            // Add final points
            if (d.points && d.points.length > 0) {
                const finalPoints = d.points[d.points.length - 1].points;
                item.append('span')
                    .style('font-family', 'Orbitron')
                    .style('font-size', '0.8rem')
                    .style('color', color)
                    .style('margin-left', '8px')
                    .text(`${finalPoints} pts`);
            }

            item.on('mouseover', function() {
                d3.select(this)
                    .style('background', color)
                    .style('transform', 'scale(1.05)');
            }).on('mouseout', function() {
                d3.select(this)
                    .style('background', 'rgba(255,255,255,0.05)')
                    .style('transform', 'scale(1)');
            });
        });
    },

    /**
     * RACE WINNERS DONUT CHART - ENHANCED WITH DYNAMIC LEGEND
     */
    drawWinnersChart(containerId, data) {
        const container = d3.select(`#${containerId}`);
        
        // Clear EVERYTHING including parent siblings (legend might be outside)
        container.selectAll('*').remove();
        
        // Also clear any legend that might exist as sibling
        const parentNode = container.node().parentNode;
        if (parentNode) {
            d3.select(parentNode).selectAll('.winners-legend').remove();
        }

        if (!data || data.length === 0) {
            container.append('div')
                .style('text-align', 'center')
                .style('padding', '60px')
                .style('color', '#52526A')
                .text('No race data available');
            return;
        }

        const rect = container.node().getBoundingClientRect();
        const width = rect.width;
        const height = 320;
        const radius = Math.min(width, height) / 2 - 50;

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Count wins per driver - FRESH calculation each time
        const winCount = d3.rollup(data, v => v.length, d => d.driver);
        const pieData = Array.from(winCount, ([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);

        const pie = d3.pie()
            .value(d => d.value)
            .sort(null)
            .padAngle(0.02);

        const arc = d3.arc()
            .innerRadius(radius * 0.55)
            .outerRadius(radius);

        const arcHover = d3.arc()
            .innerRadius(radius * 0.55)
            .outerRadius(radius * 1.1);

        const arcLabel = d3.arc()
            .innerRadius(radius * 0.85)
            .outerRadius(radius * 0.85);

        // Draw slices
        const slices = g.selectAll('.slice')
            .data(pie(pieData))
            .enter()
            .append('g')
            .attr('class', 'slice');

        slices.append('path')
            .attr('d', arc)
            .attr('fill', (d, i) => this.colors[i % this.colors.length])
            .attr('stroke', '#15151E')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
            .on('mouseover', (event, d) => {
                const color = this.colors[pieData.indexOf(d.data) % this.colors.length];
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr('d', arcHover)
                    .style('filter', `drop-shadow(0 0 15px ${color})`);
                
                const percentage = ((d.data.value / data.length) * 100).toFixed(1);
                this.showTooltip(event, `
                    <div class="tooltip-title" style="color: ${color}">${d.data.name}</div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Race Wins</span>
                        <span class="tooltip-value" style="font-size: 1.3em; color: ${color}">${d.data.value}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Win Rate</span>
                        <span class="tooltip-value">${percentage}%</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Season Races</span>
                        <span class="tooltip-value">${data.length}</span>
                    </div>
                `);
            })
            .on('mouseout', (event) => {
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr('d', arc)
                    .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
                this.hideTooltip();
            })
            .transition()
            .duration(1000)
            .attrTween('d', function(d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return t => arc(interpolate(t));
            });

        // Add percentage labels on slices
        slices.append('text')
            .attr('transform', d => `translate(${arcLabel.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('font-size', '11px')
            .attr('font-weight', '700')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .text(d => d.data.value > 1 ? d.data.value : '')
            .transition()
            .delay(1000)
            .duration(500)
            .style('opacity', 1);

        // Center text
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.3em')
            .attr('fill', '#fff')
            .attr('font-family', 'Orbitron')
            .attr('font-size', '28px')
            .attr('font-weight', '800')
            .text(data.length);

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.5em')
            .attr('fill', '#888')
            .attr('font-size', '11px')
            .attr('letter-spacing', '2px')
            .text('RACES');

        // Legend below chart - DYNAMIC based on pieData
        const legendContainer = container.append('div')
            .attr('class', 'winners-legend')
            .style('display', 'flex')
            .style('flex-wrap', 'wrap')
            .style('justify-content', 'center')
            .style('gap', '8px')
            .style('margin-top', '10px')
            .style('padding', '0 10px');

        pieData.forEach((d, i) => {
            const color = this.colors[i % this.colors.length];
            const item = legendContainer.append('div')
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('gap', '5px')
                .style('font-size', '0.72rem')
                .style('color', '#ccc')
                .style('padding', '3px 8px')
                .style('background', 'rgba(255,255,255,0.03)')
                .style('border-radius', '4px')
                .style('border-left', `3px solid ${color}`);

            item.append('span')
                .style('font-weight', '600')
                .text(`${d.name.split(' ').pop()}`);
            
            item.append('span')
                .style('color', color)
                .style('font-weight', '700')
                .text(`${d.value}`);
        });
    },

    /**
     * LEADERBOARD BAR CHART - ENHANCED
     */
    drawLeaderboardChart(containerId, data, metric = 'wins') {
        const container = d3.select(`#${containerId}`);
        container.selectAll('*').remove();

        if (!data || data.length === 0) return;

        const rect = container.node().getBoundingClientRect();
        const width = rect.width - this.margin.left - this.margin.right - 120;
        const barHeight = 35;
        const topData = data.slice(0, 12);
        const height = topData.length * (barHeight + 8);

        const svg = container.append('svg')
            .attr('width', rect.width)
            .attr('height', height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', `translate(${this.margin.left + 120},${this.margin.top})`);

        const maxValue = d3.max(topData, d => d[metric]);

        const xScale = d3.scaleLinear()
            .domain([0, maxValue * 1.1])
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(topData.map(d => d.name))
            .range([0, height])
            .padding(0.15);

        // Background bars
        svg.selectAll('.bar-bg')
            .data(topData)
            .enter()
            .append('rect')
            .attr('class', 'bar-bg')
            .attr('x', 0)
            .attr('y', d => yScale(d.name))
            .attr('width', width)
            .attr('height', yScale.bandwidth())
            .attr('fill', '#1F1F2B')
            .attr('rx', 4);

        // Main bars
        svg.selectAll('.bar')
            .data(topData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', d => yScale(d.name))
            .attr('width', 0)
            .attr('height', yScale.bandwidth())
            .attr('fill', (d, i) => {
                if (i === 0) return 'url(#goldGradient)';
                if (i === 1) return 'url(#silverGradient)';
                if (i === 2) return 'url(#bronzeGradient)';
                return '#E10600';
            })
            .attr('rx', 4)
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr('opacity', 0.8)
                    .style('filter', 'drop-shadow(0 0 10px rgba(225, 6, 0, 0.5))');
                
                this.showTooltip(event, `
                    <div class="tooltip-title">${d.name}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                        <div style="text-align: center; padding: 8px; background: rgba(255,215,0,0.1); border-radius: 6px;">
                            <div style="font-size: 1.4em; font-weight: 800; color: #FFD700">${d.wins}</div>
                            <div style="font-size: 0.7em; color: #888; letter-spacing: 1px;">WINS</div>
                        </div>
                        <div style="text-align: center; padding: 8px; background: rgba(0,255,136,0.1); border-radius: 6px;">
                            <div style="font-size: 1.4em; font-weight: 800; color: #00FF88">${d.podiums}</div>
                            <div style="font-size: 0.7em; color: #888; letter-spacing: 1px;">PODIUMS</div>
                        </div>
                        <div style="text-align: center; padding: 8px; background: rgba(0,212,255,0.1); border-radius: 6px;">
                            <div style="font-size: 1.4em; font-weight: 800; color: #00D4FF">${d.poles}</div>
                            <div style="font-size: 0.7em; color: #888; letter-spacing: 1px;">POLES</div>
                        </div>
                        <div style="text-align: center; padding: 8px; background: rgba(225,6,0,0.1); border-radius: 6px;">
                            <div style="font-size: 1.4em; font-weight: 800; color: #E10600">${d.points.toLocaleString()}</div>
                            <div style="font-size: 0.7em; color: #888; letter-spacing: 1px;">POINTS</div>
                        </div>
                    </div>
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #333; text-align: center;">
                        <span style="color: #888; font-size: 0.8em;">${d.races} Career Races</span>
                    </div>
                `);
            })
            .on('mouseout', (event) => {
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr('opacity', 1)
                    .style('filter', 'none');
                this.hideTooltip();
            })
            .transition()
            .duration(1000)
            .delay((d, i) => i * 60)
            .attr('width', d => xScale(d[metric]));

        // Add gradients
        const defs = svg.append('defs');
        
        const goldGradient = defs.append('linearGradient').attr('id', 'goldGradient');
        goldGradient.append('stop').attr('offset', '0%').attr('stop-color', '#FFD700');
        goldGradient.append('stop').attr('offset', '100%').attr('stop-color', '#FFA500');
        
        const silverGradient = defs.append('linearGradient').attr('id', 'silverGradient');
        silverGradient.append('stop').attr('offset', '0%').attr('stop-color', '#C0C0C0');
        silverGradient.append('stop').attr('offset', '100%').attr('stop-color', '#A0A0A0');
        
        const bronzeGradient = defs.append('linearGradient').attr('id', 'bronzeGradient');
        bronzeGradient.append('stop').attr('offset', '0%').attr('stop-color', '#CD7F32');
        bronzeGradient.append('stop').attr('offset', '100%').attr('stop-color', '#8B4513');

        // Position badges
        svg.selectAll('.position-badge')
            .data(topData)
            .enter()
            .append('text')
            .attr('class', 'position-badge')
            .attr('x', -115)
            .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('fill', (d, i) => i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] : '#888')
            .attr('font-family', 'Orbitron')
            .attr('font-size', '14px')
            .attr('font-weight', '700')
            .text((d, i) => `#${i + 1}`);

        // Driver names
        svg.selectAll('.driver-label')
            .data(topData)
            .enter()
            .append('text')
            .attr('class', 'driver-label')
            .attr('x', -10)
            .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .attr('fill', '#fff')
            .attr('font-size', '13px')
            .attr('font-weight', '600')
            .text(d => {
                const parts = d.name.split(' ');
                return parts.length > 1 ? parts[parts.length - 1] : d.name;
            });

        // Value labels
        svg.selectAll('.value-label')
            .data(topData)
            .enter()
            .append('text')
            .attr('class', 'value-label')
            .attr('x', d => xScale(d[metric]) + 10)
            .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('fill', '#fff')
            .attr('font-family', 'Orbitron')
            .attr('font-size', '14px')
            .attr('font-weight', '700')
            .text(d => d[metric])
            .attr('opacity', 0)
            .transition()
            .duration(500)
            .delay((d, i) => 1000 + i * 60)
            .attr('opacity', 1);
    },

    /**
     * POINTS DISTRIBUTION BAR CHART - ENHANCED
     */
    drawPointsChart(containerId, standings) {
        const container = d3.select(`#${containerId}`);
        container.selectAll('*').remove();

        if (!standings || standings.length === 0) {
            container.append('div')
                .style('text-align', 'center')
                .style('padding', '60px')
                .style('color', '#52526A')
                .text('No standings data available');
            return;
        }

        const data = standings.slice(0, 10);
        const rect = container.node().getBoundingClientRect();
        const width = rect.width - this.margin.left - this.margin.right;
        const height = 280 - this.margin.top - this.margin.bottom;

        const svg = container.append('svg')
            .attr('width', rect.width)
            .attr('height', 280)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        const xScale = d3.scaleBand()
            .domain(data.map((d, i) => i))
            .range([0, width])
            .padding(0.25);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.points) * 1.1])
            .range([height, 0]);

        // Grid
        svg.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat('')
            )
            .style('opacity', 0.3);

        // Bars
        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (d, i) => xScale(i))
            .attr('y', height)
            .attr('width', xScale.bandwidth())
            .attr('height', 0)
            .attr('fill', (d, i) => {
                if (i === 0) return '#FFD700';
                if (i === 1) return '#C0C0C0';
                if (i === 2) return '#CD7F32';
                return '#E10600';
            })
            .attr('rx', 4)
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr('opacity', 0.8);
                
                const driverName = d.driver?.fullName || 'Unknown';
                const gap = data[0].points - d.points;
                
                this.showTooltip(event, `
                    <div class="tooltip-title">${driverName}</div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Position</span>
                        <span class="tooltip-value">P${d.position}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Points</span>
                        <span class="tooltip-value" style="color: #FFD700; font-size: 1.2em">${d.points}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Wins</span>
                        <span class="tooltip-value">${d.wins}</span>
                    </div>
                    ${d.position > 1 ? `
                    <div class="tooltip-row">
                        <span class="tooltip-label">Gap to Leader</span>
                        <span class="tooltip-value" style="color: #E10600">-${gap} pts</span>
                    </div>
                    ` : ''}
                `);
            })
            .on('mouseout', (event) => {
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr('opacity', 1);
                this.hideTooltip();
            })
            .transition()
            .duration(800)
            .delay((d, i) => i * 80)
            .attr('y', d => yScale(d.points))
            .attr('height', d => height - yScale(d.points));

        // X Axis with driver names
        const xAxis = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0,${height})`);

        xAxis.selectAll('.driver-name')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'driver-name')
            .attr('x', (d, i) => xScale(i) + xScale.bandwidth() / 2)
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .attr('fill', '#888')
            .attr('font-size', '10px')
            .text(d => {
                const name = d.driver?.fullName || 'Unknown';
                const parts = name.split(' ');
                return parts.length > 1 ? parts[parts.length - 1].substring(0, 3).toUpperCase() : name.substring(0, 3).toUpperCase();
            });

        // Y Axis
        svg.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(yScale).ticks(5));
    },

    /**
     * CONSTRUCTOR DOMINANCE STACKED AREA - ENHANCED
     */
    drawDominanceChart(containerId, data) {
        const container = d3.select(`#${containerId}`);
        container.selectAll('*').remove();

        if (!data || data.length === 0) return;

        const rect = container.node().getBoundingClientRect();
        const width = rect.width - this.margin.left - this.margin.right;
        const height = 400 - this.margin.top - this.margin.bottom;

        const svg = container.append('svg')
            .attr('width', rect.width)
            .attr('height', 400)
            .append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Get all unique constructors
        const allKeys = new Set();
        data.forEach(d => {
            Object.keys(d).forEach(k => {
                if (k !== 'decade') allKeys.add(k);
            });
        });
        const keys = Array.from(allKeys).slice(0, 10);

        // Stack the data
        const stack = d3.stack()
            .keys(keys)
            .value((d, key) => d[key] || 0);

        const series = stack(data);

        // Scales
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.decade))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(series, s => d3.max(s, d => d[1]))])
            .range([height, 0]);

        // Color scale
        const colorScale = d3.scaleOrdinal()
            .domain(keys)
            .range(this.colors);

        // Areas
        const area = d3.area()
            .x(d => xScale(d.data.decade) + xScale.bandwidth() / 2)
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]))
            .curve(d3.curveMonotoneX);

        svg.selectAll('.area')
            .data(series)
            .enter()
            .append('path')
            .attr('class', 'area')
            .attr('fill', d => colorScale(d.key))
            .attr('opacity', 0.85)
            .attr('d', area)
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                const color = colorScale(d.key);
                d3.select(event.target)
                    .attr('opacity', 1)
                    .style('filter', `drop-shadow(0 0 10px ${color})`);
                
                const totalWins = d.reduce((sum, point) => sum + (point[1] - point[0]), 0);
                
                this.showTooltip(event, `
                    <div class="tooltip-title" style="color: ${color}">${d.key}</div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Total Wins (All Eras)</span>
                        <span class="tooltip-value" style="color: ${color}">${totalWins}</span>
                    </div>
                `);
            })
            .on('mouseout', (event) => {
                d3.select(event.target)
                    .attr('opacity', 0.85)
                    .style('filter', 'none');
                this.hideTooltip();
            });

        // Axes
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        svg.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(yScale).ticks(5));

        // Legend
        const legend = container.append('div')
            .attr('class', 'chart-legend')
            .style('margin-top', '15px');

        keys.forEach((key, i) => {
            const item = legend.append('div')
                .attr('class', 'legend-item')
                .style('cursor', 'pointer');

            item.append('div')
                .attr('class', 'legend-color')
                .style('background', colorScale(key));

            item.append('span')
                .attr('class', 'legend-text')
                .text(key);
        });
    },

    /**
     * WORLD MAP - ENHANCED
     */
    async drawWorldMap(containerId, circuits) {
        const container = d3.select(`#${containerId}`);
        container.selectAll('*').remove();

        const rect = container.node().getBoundingClientRect();
        const width = rect.width;
        const height = 450;

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height);

        try {
            const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
            
            const projection = d3.geoNaturalEarth1()
                .scale(width / 5.5)
                .translate([width / 2, height / 2]);

            const path = d3.geoPath().projection(projection);

            // Draw countries
            svg.append('g')
                .selectAll('path')
                .data(topojson.feature(world, world.objects.countries).features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('fill', '#252532')
                .attr('stroke', '#38384A')
                .attr('stroke-width', 0.5);

            // Draw circuits
            const validCircuits = circuits.filter(c => c.lat && c.lng && c.totalRaces > 0);

            const radiusScale = d3.scaleSqrt()
                .domain([0, d3.max(validCircuits, d => d.totalRaces)])
                .range([5, 25]);

            // Pulse animation for circuits
            const pulseCircuits = svg.selectAll('.circuit-pulse')
                .data(validCircuits)
                .enter()
                .append('circle')
                .attr('class', 'circuit-pulse')
                .attr('cx', d => projection([d.lng, d.lat])[0])
                .attr('cy', d => projection([d.lng, d.lat])[1])
                .attr('r', d => radiusScale(d.totalRaces))
                .attr('fill', 'none')
                .attr('stroke', '#E10600')
                .attr('stroke-width', 2)
                .attr('opacity', 0);

            // Main circuit markers
            svg.selectAll('.circuit')
                .data(validCircuits)
                .enter()
                .append('circle')
                .attr('class', 'circuit')
                .attr('cx', d => projection([d.lng, d.lat])[0])
                .attr('cy', d => projection([d.lng, d.lat])[1])
                .attr('r', 0)
                .attr('fill', '#E10600')
                .attr('stroke', '#fff')
                .attr('stroke-width', 2)
                .attr('opacity', 0.9)
                .style('cursor', 'pointer')
                .on('mouseover', (event, d) => {
                    d3.select(event.target)
                        .transition()
                        .duration(200)
                        .attr('r', radiusScale(d.totalRaces) * 1.5)
                        .style('filter', 'drop-shadow(0 0 15px #E10600)');
                    
                    this.showTooltip(event, `
                        <div class="tooltip-title" style="color: #E10600">${d.name}</div>
                        <div class="tooltip-row">
                            <span class="tooltip-label">Location</span>
                            <span class="tooltip-value">${d.location}, ${d.country}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-label">Grands Prix Hosted</span>
                            <span class="tooltip-value" style="color: #FFD700; font-size: 1.2em">${d.totalRaces}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-label">Unique Winners</span>
                            <span class="tooltip-value">${d.uniqueWinners}</span>
                        </div>
                        ${d.mostWins ? `
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #333;">
                            <div style="color: #888; font-size: 0.8em; margin-bottom: 4px;">CIRCUIT KING</div>
                            <div style="color: #00FF88; font-weight: 700">${d.mostWins.name}</div>
                            <div style="color: #888; font-size: 0.85em">${d.mostWins.wins} wins</div>
                        </div>
                        ` : ''}
                    `);
                })
                .on('mouseout', (event, d) => {
                    d3.select(event.target)
                        .transition()
                        .duration(200)
                        .attr('r', radiusScale(d.totalRaces))
                        .style('filter', 'none');
                    this.hideTooltip();
                })
                .transition()
                .duration(1000)
                .delay((d, i) => i * 40)
                .attr('r', d => radiusScale(d.totalRaces));

        } catch (error) {
            console.error('Error loading map:', error);
            container.append('div')
                .style('text-align', 'center')
                .style('padding', '60px')
                .style('color', '#52526A')
                .text('Could not load map data');
        }
    },

    /**
     * RESULTS MATRIX HEATMAP - NEW!
     */
    drawResultsMatrix(containerId, races, results, drivers) {
        const container = d3.select(`#${containerId}`);
        container.selectAll('*').remove();

        if (!races || races.length === 0) {
            container.append('div')
                .style('text-align', 'center')
                .style('padding', '60px')
                .style('color', '#52526A')
                .text('No race data available for this season');
            return;
        }

        const rect = container.node().getBoundingClientRect();
        const margin = { top: 100, right: 30, bottom: 30, left: 150 };
        const cellSize = 28;
        const width = Math.min(races.length * cellSize + margin.left + margin.right, rect.width);
        const height = Math.min(drivers.length * cellSize + margin.top + margin.bottom, 600);

        const svg = container.append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Color scale for positions
        const colorScale = d3.scaleSequential()
            .domain([1, 20])
            .interpolator(d3.interpolateRgbBasis(['#FFD700', '#00FF88', '#00D4FF', '#E10600', '#333']));

        // X Scale (races)
        const xScale = d3.scaleBand()
            .domain(races.map(r => r.round))
            .range([0, races.length * cellSize])
            .padding(0.1);

        // Y Scale (drivers)
        const yScale = d3.scaleBand()
            .domain(drivers.map(d => d.id))
            .range([0, drivers.length * cellSize])
            .padding(0.1);

        // Draw cells
        results.forEach(result => {
            const x = xScale(result.round);
            const y = yScale(result.driverId);
            
            if (x === undefined || y === undefined) return;

            svg.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', xScale.bandwidth())
                .attr('height', yScale.bandwidth())
                .attr('fill', result.position ? colorScale(result.position) : '#333')
                .attr('rx', 3)
                .attr('stroke', '#15151E')
                .attr('stroke-width', 1)
                .style('cursor', 'pointer')
                .on('mouseover', (event) => {
                    const driver = drivers.find(d => d.id === result.driverId);
                    const race = races.find(r => r.round === result.round);
                    
                    this.showTooltip(event, `
                        <div class="tooltip-title">${driver?.name || 'Unknown'}</div>
                        <div class="tooltip-row">
                            <span class="tooltip-label">Race</span>
                            <span class="tooltip-value">${race?.name || ''}</span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-label">Finish</span>
                            <span class="tooltip-value" style="color: ${result.position ? colorScale(result.position) : '#E10600'}">
                                ${result.position ? 'P' + result.position : 'DNF'}
                            </span>
                        </div>
                        <div class="tooltip-row">
                            <span class="tooltip-label">Points</span>
                            <span class="tooltip-value">${result.points}</span>
                        </div>
                    `);
                })
                .on('mouseout', () => this.hideTooltip());

            // Add position text
            if (result.position && result.position <= 3) {
                svg.append('text')
                    .attr('x', x + xScale.bandwidth() / 2)
                    .attr('y', y + yScale.bandwidth() / 2)
                    .attr('text-anchor', 'middle')
                    .attr('dy', '0.35em')
                    .attr('fill', '#000')
                    .attr('font-size', '10px')
                    .attr('font-weight', '700')
                    .text(result.position);
            }
        });

        // X Axis (race rounds)
        svg.append('g')
            .attr('transform', `translate(0,-10)`)
            .selectAll('text')
            .data(races)
            .enter()
            .append('text')
            .attr('x', d => xScale(d.round) + xScale.bandwidth() / 2)
            .attr('y', 0)
            .attr('text-anchor', 'end')
            .attr('transform', d => `rotate(-45, ${xScale(d.round) + xScale.bandwidth() / 2}, 0)`)
            .attr('fill', '#888')
            .attr('font-size', '9px')
            .text(d => d.name.replace('Grand Prix', 'GP').substring(0, 12));

        // Y Axis (drivers)
        svg.append('g')
            .selectAll('text')
            .data(drivers)
            .enter()
            .append('text')
            .attr('x', -10)
            .attr('y', d => yScale(d.id) + yScale.bandwidth() / 2)
            .attr('text-anchor', 'end')
            .attr('dy', '0.35em')
            .attr('fill', '#fff')
            .attr('font-size', '11px')
            .text(d => d.name.split(' ').pop());

        // Legend
        const legendWidth = 200;
        const legendHeight = 15;
        
        const legendScale = d3.scaleLinear()
            .domain([1, 20])
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .tickValues([1, 5, 10, 15, 20])
            .tickFormat(d => 'P' + d);

        const legend = svg.append('g')
            .attr('transform', `translate(${(races.length * cellSize - legendWidth) / 2}, ${drivers.length * cellSize + 20})`);

        // Gradient
        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'positionGradient');

        [1, 5, 10, 15, 20].forEach((pos, i) => {
            gradient.append('stop')
                .attr('offset', `${i * 25}%`)
                .attr('stop-color', colorScale(pos));
        });

        legend.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .attr('fill', 'url(#positionGradient)')
            .attr('rx', 3);

        legend.append('g')
            .attr('transform', `translate(0, ${legendHeight})`)
            .call(legendAxis)
            .selectAll('text')
            .attr('fill', '#888')
            .attr('font-size', '9px');
    },

    /**
     * PIT STOP SCATTER PLOT - FIXED BOUNDS
     */
    drawPitStopChart(containerId, pitStops, driverMap) {
        const container = d3.select(`#${containerId}`);
        container.selectAll('*').remove();

        if (!pitStops || pitStops.length === 0) {
            container.append('div')
                .style('text-align', 'center')
                .style('padding', '60px')
                .style('color', '#52526A')
                .text('No pit stop data available');
            return;
        }

        const rect = container.node().getBoundingClientRect();
        const margin = { top: 50, right: 30, bottom: 50, left: 60 };
        const width = rect.width - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        // Define Y-axis bounds (in seconds)
        const yMin = 18;
        const yMax = 40;

        // STRICT filter: Only pit stops within Y-axis bounds AND reasonable X values
        const validStops = pitStops.filter(p => {
            const durationSec = p.milliseconds / 1000;
            return p.milliseconds > 0 && 
                   p.lap > 0 && 
                   durationSec >= yMin && 
                   durationSec <= yMax;
        });

        if (validStops.length === 0) {
            container.append('div')
                .style('text-align', 'center')
                .style('padding', '60px')
                .style('color', '#52526A')
                .text('No valid pit stop data in displayable range');
            return;
        }

        const svg = container.append('svg')
            .attr('width', rect.width)
            .attr('height', 350);

        // Add clip path to prevent any overflow
        svg.append('defs')
            .append('clipPath')
            .attr('id', 'pitstop-clip')
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(validStops, d => d.lap) || 70])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([height, 0]);

        // Grid
        g.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''))
            .style('opacity', 0.2);

        // Axes
        g.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(10));

        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(yScale).tickFormat(d => d + 's'));

        // Labels
        g.append('text')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .attr('fill', '#888')
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('LAP NUMBER');

        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -45)
            .attr('fill', '#888')
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('PIT STOP DURATION (seconds)');

        // Reference line for great stops
        g.append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', yScale(25))
            .attr('y2', yScale(25))
            .attr('stroke', '#00FF88')
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0.5);

        g.append('text')
            .attr('x', width - 5)
            .attr('y', yScale(25) - 5)
            .attr('fill', '#00FF88')
            .attr('text-anchor', 'end')
            .attr('font-size', '10px')
            .text('Great Stop (< 25s)');

        // Create clipped group for dots
        const dotsGroup = g.append('g')
            .attr('clip-path', 'url(#pitstop-clip)');

        // Draw points - only within bounds
        dotsGroup.selectAll('.pit-dot')
            .data(validStops)
            .enter()
            .append('circle')
            .attr('class', 'pit-dot')
            .attr('cx', d => xScale(d.lap))
            .attr('cy', d => yScale(d.milliseconds / 1000))
            .attr('r', 0)
            .attr('fill', d => {
                const duration = d.milliseconds / 1000;
                if (duration < 22) return '#FFD700';
                if (duration < 25) return '#00FF88';
                if (duration < 30) return '#00D4FF';
                return '#E10600';
            })
            .attr('opacity', 0.8)
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => {
                const driver = driverMap.get(d.driverId);
                const duration = (d.milliseconds / 1000).toFixed(3);
                
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr('r', 10)
                    .attr('opacity', 1);
                
                this.showTooltip(event, `
                    <div class="tooltip-title">${driver?.fullName || 'Unknown Driver'}</div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Stop #</span>
                        <span class="tooltip-value">${d.stop}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Lap</span>
                        <span class="tooltip-value">${d.lap}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Duration</span>
                        <span class="tooltip-value" style="color: ${d.milliseconds < 25000 ? '#00FF88' : '#E10600'}; font-size: 1.2em">
                            ${duration}s
                        </span>
                    </div>
                `);
            })
            .on('mouseout', (event) => {
                d3.select(event.target)
                    .transition()
                    .duration(200)
                    .attr('r', 5)
                    .attr('opacity', 0.8);
                this.hideTooltip();
            })
            .transition()
            .duration(500)
            .delay((d, i) => Math.min(i * 3, 500))
            .attr('r', 5);

        // Add count of displayed vs total
        const totalStops = pitStops.length;
        const displayedStops = validStops.length;
        
        if (displayedStops < totalStops) {
            g.append('text')
                .attr('x', width)
                .attr('y', -10)
                .attr('fill', '#666')
                .attr('text-anchor', 'end')
                .attr('font-size', '10px')
                .text(`Showing ${displayedStops} of ${totalStops} stops (${yMin}s-${yMax}s range)`);
        }
    },

    /**
     * DRIVER COMPARISON - ENHANCED
     */
    drawDriverComparison(containerId, driver1Stats, driver2Stats) {
        const container = d3.select(`#${containerId}`);
        container.selectAll('*').remove();

        if (!driver1Stats || !driver2Stats) {
            container.append('div')
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('justify-content', 'center')
                .style('height', '300px')
                .style('color', '#52526A')
                .style('font-size', '1.1rem')
                .style('text-align', 'center')
                .html('Select two drivers above and click <strong style="color: #E10600">COMPARE</strong> to see head-to-head statistics');
            return;
        }

        // Create comparison cards
        const comparison = container.append('div')
            .style('display', 'grid')
            .style('grid-template-columns', '1fr auto 1fr')
            .style('gap', '30px')
            .style('align-items', 'start');

        // Driver 1 Card
        this.drawDriverCard(comparison, driver1Stats, '#00FF88', 'left');

        // VS
        comparison.append('div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center')
            .style('font-family', 'Orbitron')
            .style('font-size', '2.5rem')
            .style('font-weight', '900')
            .style('color', '#38384A')
            .style('text-shadow', '0 0 20px rgba(225, 6, 0, 0.3)')
            .text('VS');

        // Driver 2 Card
        this.drawDriverCard(comparison, driver2Stats, '#E10600', 'right');

        // Stats comparison bars
        const statsContainer = container.append('div')
            .style('margin-top', '30px')
            .style('padding', '25px')
            .style('background', '#1A1A24')
            .style('border-radius', '12px')
            .style('border', '1px solid #38384A');

        statsContainer.append('h3')
            .style('text-align', 'center')
            .style('color', '#888')
            .style('font-size', '0.9rem')
            .style('letter-spacing', '3px')
            .style('margin-bottom', '20px')
            .text('HEAD-TO-HEAD COMPARISON');

        const metrics = [
            { key: 'wins', label: 'RACE WINS', icon: '🏆' },
            { key: 'podiums', label: 'PODIUMS', icon: '🥇' },
            { key: 'poles', label: 'POLE POSITIONS', icon: '⚡' },
            { key: 'points', label: 'CAREER POINTS', icon: '📊' }
        ];

        metrics.forEach(metric => {
            this.drawComparisonBar(statsContainer, metric, driver1Stats, driver2Stats);
        });
    },

    /**
     * Draw driver card for comparison
     */
    drawDriverCard(parent, stats, color, align) {
        const card = parent.append('div')
            .style('background', 'linear-gradient(145deg, #1F1F2B 0%, #15151E 100%)')
            .style('border-radius', '16px')
            .style('padding', '25px')
            .style('border', `2px solid ${color}`)
            .style('box-shadow', `0 0 30px ${color}30`)
            .style('text-align', align);

        card.append('h3')
            .style('font-family', 'Exo 2')
            .style('font-size', '1.4rem')
            .style('color', color)
            .style('margin-bottom', '5px')
            .text(stats.name);

        if (stats.nationality) {
            card.append('div')
                .style('font-size', '0.85rem')
                .style('color', '#888')
                .style('margin-bottom', '20px')
                .text(stats.nationality);
        }

        if (stats.championships.length > 0) {
            card.append('div')
                .style('display', 'inline-block')
                .style('background', 'linear-gradient(135deg, #FFD700, #FFA500)')
                .style('color', '#000')
                .style('padding', '4px 12px')
                .style('border-radius', '20px')
                .style('font-size', '0.8rem')
                .style('font-weight', '700')
                .style('margin-bottom', '20px')
                .text(`🏆 ${stats.championships.length}x WORLD CHAMPION`);
        }

        const statGrid = card.append('div')
            .style('display', 'grid')
            .style('grid-template-columns', '1fr 1fr')
            .style('gap', '15px');

        [
            { label: 'RACES', value: stats.races },
            { label: 'WINS', value: stats.wins },
            { label: 'PODIUMS', value: stats.podiums },
            { label: 'POLES', value: stats.poles },
            { label: 'POINTS', value: stats.points.toLocaleString() },
            { label: 'AVG FINISH', value: stats.avgFinish }
        ].forEach(stat => {
            const item = statGrid.append('div')
                .style('background', 'rgba(255,255,255,0.03)')
                .style('padding', '12px')
                .style('border-radius', '8px');
            
            item.append('div')
                .style('font-family', 'Orbitron')
                .style('font-size', '1.6rem')
                .style('font-weight', '700')
                .style('color', '#fff')
                .text(stat.value);
            
            item.append('div')
                .style('font-size', '0.65rem')
                .style('color', '#666')
                .style('letter-spacing', '1px')
                .style('margin-top', '4px')
                .text(stat.label);
        });
    },

    /**
     * Draw comparison bar
     */
    drawComparisonBar(parent, metric, stats1, stats2) {
        const val1 = stats1[metric.key];
        const val2 = stats2[metric.key];
        const total = val1 + val2;
        const pct1 = total > 0 ? (val1 / total * 100) : 50;
        const pct2 = total > 0 ? (val2 / total * 100) : 50;

        const row = parent.append('div')
            .style('margin-bottom', '20px');

        row.append('div')
            .style('display', 'flex')
            .style('justify-content', 'space-between')
            .style('margin-bottom', '8px')
            .html(`
                <span style="color: #00FF88; font-weight: 700">${val1.toLocaleString()}</span>
                <span style="color: #888; font-size: 0.85rem; letter-spacing: 2px">${metric.icon} ${metric.label}</span>
                <span style="color: #E10600; font-weight: 700">${val2.toLocaleString()}</span>
            `);

        const barContainer = row.append('div')
            .style('display', 'flex')
            .style('height', '24px')
            .style('border-radius', '12px')
            .style('overflow', 'hidden')
            .style('background', '#252532');

        barContainer.append('div')
            .style('width', `${pct1}%`)
            .style('background', 'linear-gradient(90deg, #00FF88, #00CC66)')
            .style('transition', 'width 1s ease');

        barContainer.append('div')
            .style('width', `${pct2}%`)
            .style('background', 'linear-gradient(90deg, #E10600, #FF4444)')
            .style('transition', 'width 1s ease');
    },

    /**
     * Draw team standings
     */
    drawTeamStandings(containerId, standings) {
        const container = d3.select(`#${containerId}`);
        container.selectAll('*').remove();

        if (!standings || standings.length === 0) return;

        standings.forEach((team, index) => {
            const color = this.teamColors[team.constructor?.name] || this.colors[index % this.colors.length];
            
            const card = container.append('div')
                .attr('class', 'team-card')
                .style('border-left-color', color)
                .style('animation', `fadeIn 0.5s ease ${index * 0.1}s both`)
                .style('cursor', 'pointer')
                .on('mouseover', function() {
                    d3.select(this)
                        .style('transform', 'translateX(10px)')
                        .style('box-shadow', `0 0 20px ${color}40`);
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .style('transform', 'translateX(0)')
                        .style('box-shadow', 'none');
                });

            const header = card.append('div')
                .style('display', 'flex')
                .style('justify-content', 'space-between')
                .style('align-items', 'center')
                .style('margin-bottom', '10px');

            header.append('span')
                .style('font-family', 'Orbitron')
                .style('font-size', '1.3rem')
                .style('font-weight', '700')
                .style('color', color)
                .text(`P${team.position}`);

            header.append('span')
                .attr('class', 'team-name')
                .style('color', '#fff')
                .text(team.constructor?.name || 'Unknown');

            const stats = card.append('div')
                .attr('class', 'team-stats');

            stats.append('span')
                .style('color', '#888')
                .text(`${team.wins} Wins`);

            stats.append('span')
                .attr('class', 'team-points')
                .style('color', color)
                .text(`${team.points} PTS`);
        });
    },

    /**
     * Animate stat rings
     */
    animateStatRings(stats) {
        const maxValues = {
            totalRaces: 1200,
            totalDrivers: 900,
            totalTeams: 250,
            totalCircuits: 80
        };

        const mapping = {
            'races': 'totalRaces',
            'drivers': 'totalDrivers',
            'teams': 'totalTeams',
            'circuits': 'totalCircuits'
        };

        Object.keys(mapping).forEach(key => {
            const ring = d3.select(`#ring-${key}`);
            const circumference = 283;
            const value = stats[mapping[key]] || 0;
            const percentage = Math.min(value / maxValues[mapping[key]], 1);
            const offset = circumference * (1 - percentage);

            ring.transition()
                .duration(2000)
                .ease(d3.easeQuadOut)
                .attr('stroke-dashoffset', offset);
        });
    }
};

// Export
window.Visualizations = Visualizations;