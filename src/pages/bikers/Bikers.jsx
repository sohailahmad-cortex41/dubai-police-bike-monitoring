import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import { getData } from '../../api/axios'
import { FaUser, FaPhone, FaEnvelope, FaCalendar, FaFilter, FaTimes, FaUsers, FaSearch } from 'react-icons/fa'
import './Bikers.css'

export default function Bikers() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        search: '',
        phone: '',
        email: '',
        dateFrom: '',
        dateTo: ''
    })

    const navigate = useNavigate()

    const getBikers = async () => {
        try {
            setLoading(true)
            const response = await getData('bikers')
            if (response?.success === false) {
                console.error('Failed to fetch bikers data:', response?.message)
                return
            }
            const bikersData = response.bikers || []
            console.log('Bikers data:', bikersData)
            setData(bikersData)
        } catch (error) {
            console.error('Error fetching bikers data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getBikers()
    }, [])

    // Filtered data based on current filters
    const filteredData = useMemo(() => {
        return data.filter(biker => {
            const matchesSearch = !filters.search ||
                biker.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                biker.id?.toString().includes(filters.search)

            const matchesPhone = !filters.phone ||
                biker.phone_number?.includes(filters.phone)

            const matchesEmail = !filters.email ||
                biker.email?.toLowerCase().includes(filters.email.toLowerCase())

            const matchesDateFrom = !filters.dateFrom ||
                new Date(biker.created_at) >= new Date(filters.dateFrom)

            const matchesDateTo = !filters.dateTo ||
                new Date(biker.created_at) <= new Date(filters.dateTo)

            return matchesSearch && matchesPhone && matchesEmail && matchesDateFrom && matchesDateTo
        })
    }, [data, filters])

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            phone: '',
            email: '',
            dateFrom: '',
            dateTo: ''
        })
    }

    const handleBikerClick = (bikerId) => {
        navigate(`/dashboard?bikerId=${bikerId}`)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
    }

    if (loading) {
        return (
            <div>
                <DashboardHeader />
                <div className="bikers-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <DashboardHeader />
            <div className="bikers-container">
                <div className="bikers-header">
                    <h1 className="bikers-title">
                        <FaUsers />
                        Bikers Management
                    </h1>
                    <p className="bikers-subtitle">
                        Manage and monitor all registered bikers in the system
                    </p>
                </div>

                {/* Statistics */}
                <div className="bikers-stats">
                    <div className="stat-card">
                        <div className="stat-number">{data.length}</div>
                        <div className="stat-label">Total Bikers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{filteredData.length}</div>
                        <div className="stat-label">Filtered Results</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {data.filter(b => new Date(b.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                        </div>
                        <div className="stat-label">Last 30 Days</div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="filters-section">
                    <h3 className="filters-title">
                        <FaFilter />
                        Filters
                    </h3>
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label className="filter-label">Search (Name or ID)</label>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="Search by name or ID..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Phone Number</label>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="Filter by phone..."
                                value={filters.phone}
                                onChange={(e) => handleFilterChange('phone', e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Email</label>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="Filter by email..."
                                value={filters.email}
                                onChange={(e) => handleFilterChange('email', e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">From Date</label>
                            <input
                                type="date"
                                className="filter-input"
                                value={filters.dateFrom}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">To Date</label>
                            <input
                                type="date"
                                className="filter-input"
                                value={filters.dateTo}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <button
                                className="clear-filters-btn"
                                onClick={clearFilters}
                            >
                                <FaTimes />
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bikers Grid */}
                {filteredData.length === 0 ? (
                    <div className="no-bikers">
                        <FaSearch className="no-bikers-icon" />
                        <h3 className="no-bikers-title">
                            {data.length === 0 ? 'No Bikers Found' : 'No Results Found'}
                        </h3>
                        <p className="no-bikers-subtitle">
                            {data.length === 0
                                ? 'No bikers have been registered yet.'
                                : 'Try adjusting your filters to find more results.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="bikers-grid">
                        {filteredData.map((biker) => (
                            <div
                                key={biker.id}
                                className="biker-card"
                                onClick={() => handleBikerClick(biker.id)}
                            >
                                <div className="biker-header">
                                    <div className="biker-avatar">
                                        {getInitials(biker.name)}
                                    </div>
                                    <div className="biker-basic-info">
                                        <h3 className="biker-name">{biker.name}</h3>
                                        <span className="biker-id">ID: {biker.id}</span>
                                    </div>
                                </div>

                                <div className="biker-details">
                                    <div className="biker-detail">
                                        <FaPhone className="detail-icon" />
                                        <span className="detail-text">{biker.phone_number}</span>
                                    </div>

                                    <div className="biker-detail">
                                        <FaEnvelope className="detail-icon" />
                                        <span className="detail-text">{biker.email}</span>
                                    </div>

                                    <div className="biker-detail">
                                        <FaCalendar className="detail-icon" />
                                        <span className="detail-text">
                                            Registered: {formatDate(biker.created_at)}
                                        </span>
                                    </div>
                                </div>

                                <div className="biker-created">
                                    Click to view dashboard
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
