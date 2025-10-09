import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import { getData, postData } from '../../api/axios'
import { FaUser, FaPhone, FaEnvelope, FaCalendar, FaFilter, FaTimes, FaUsers, FaSearch, FaPlus, FaExclamationTriangle } from 'react-icons/fa'
import './Bikers.css'

export default function Bikers() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [filters, setFilters] = useState({
        search: '',
        phone: '',
        email: '',
        dateFrom: '',
        dateTo: ''
    })
    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        email: ''
    })
    const [formErrors, setFormErrors] = useState({})

    const navigate = useNavigate()

    const getBikers = async () => {
        try {
            setLoading(true)
            const response = await getData('bikers')
            if (response?.success === false) {
                console.error('Failed to fetch bikers data:', response?.message)
                return
            }
            const bikersData = response.bikers.reverse() || []
            // console.log('Bikers data:', bikersData)
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

    const validateForm = () => {
        const errors = {}

        if (!formData.name.trim()) {
            errors.name = 'Name is required'
        }

        // if (!formData.phone_number.trim()) {
        //     errors.phone_number = 'Phone number is required'
        // } else if (!/^\d{10,15}$/.test(formData.phone_number.replace(/\s/g, ''))) {
        //     errors.phone_number = 'Please enter a valid phone number'
        // }

        // if (!formData.email.trim()) {
        //     errors.email = 'Email is required'
        // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        //     errors.email = 'Please enter a valid email address'
        // }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            const url = `http://0.0.0.0:5455/bikers/?name=${encodeURIComponent(formData.name)}&phone_number=${encodeURIComponent(formData.phone_number)}&email=${encodeURIComponent(formData.email)}`

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const result = await response.json()

            if (response.ok && (result.success || result.status === 'success')) {
                // Reset form and close modal
                setFormData({ name: '', phone_number: '', email: '' })
                setShowAddModal(false)
                setFormErrors({})

                // Refresh bikers list
                await getBikers()

                // Navigate to dashboard with new biker ID if provided
                if (result.biker?.id) {
                    navigate(`/dashboard?bikerId=${result.biker.id}`)
                }
            } else {
                console.error('Failed to add biker:', result.detail || result.message)

                // Handle specific error cases
                let errorMessage = 'Failed to add biker. Please try again.'

                if (result.detail || result.message) {
                    const errorText = result.detail || result.message

                    // Check for unique constraint violations
                    if (errorText.includes('UNIQUE constraint failed: bikers.email')) {
                        setFormErrors({
                            email: 'This email address is already registered with another biker.',
                            submit: 'A biker with this email address already exists. Please use a different email address.'
                        })
                        return
                    } else if (errorText.includes('UNIQUE constraint failed: bikers.phone_number')) {
                        setFormErrors({
                            phone_number: 'This phone number is already registered with another biker.',
                            submit: 'A biker with this phone number already exists. Please use a different phone number.'
                        })
                        return
                    } else if (errorText.includes('UNIQUE constraint failed')) {
                        errorMessage = 'This information is already registered with another biker. Please check your details and try again.'
                    } else if (errorText.includes('validation')) {
                        errorMessage = 'Please check your information and make sure all fields are filled correctly.'
                    } else {
                        errorMessage = 'Unable to add biker. Please check your information and try again.'
                    }
                }

                setFormErrors({ submit: errorMessage })
            }
        } catch (error) {
            console.error('Error adding biker:', error)
            setFormErrors({ submit: 'Network error. Please check your connection and try again.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear errors when user starts typing
        if (formErrors[field] || formErrors.submit) {
            setFormErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                delete newErrors.submit
                return newErrors
            })
        }
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
                {/* Header Wrapper */}
                <div className="bikers-header-wrapper">


                    <div className="header-actions">
                        <div>
                            <div className="bikers-header">
                                <h1 className="bikers-title">
                                    <FaUsers />
                                    Bikers Management
                                </h1>
                                <p className="bikers-subtitle">
                                    Manage and monitor all registered bikers in the system
                                </p>
                            </div>
                            <div className="action-buttons">
                                <button
                                    className="add-biker-btn"
                                    onClick={() => setShowAddModal(true)}
                                >
                                    <FaPlus />
                                    Add New Biker
                                </button>
                                <button
                                    className={`toggle-filters-btn ${showFilters ? 'active' : ''}`}
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <FaFilter />
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                </button>
                            </div>
                        </div>
                        {/* Statistics */}
                        <div className="bikers-stats">
                            <div className="stat-item">
                                <div className="stat-number">{data.length}</div>
                                <div className="stat-label">Total Bikers</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{filteredData.length}</div>
                                <div className="stat-label">Filtered Results</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">
                                    {data.filter(b => new Date(b.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                                </div>
                                <div className="stat-label">Last 30 Days</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className={`filters-section ${showFilters ? 'visible' : 'hidden'}`}>
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

                {/* Add Biker Modal */}
                {showAddModal && (
                    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2 className="modal-title">
                                    <FaUser />
                                    Add New Biker
                                </h2>
                                <button
                                    className="modal-close-btn"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Name *</label>
                                    <input
                                        type="text"
                                        className={`form-input ${formErrors.name ? 'error' : ''}`}
                                        placeholder="Enter biker's full name"
                                        value={formData.name}
                                        onChange={(e) => handleFormChange('name', e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.name && (
                                        <div className="error-message">
                                            <FaExclamationTriangle />
                                            {formErrors.name}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phone Number *</label>
                                    <input
                                        type="tel"
                                        className={`form-input ${formErrors.phone_number ? 'error' : ''}`}
                                        placeholder="Enter phone number (e.g., 03122246165)"
                                        value={formData.phone_number}
                                        onChange={(e) => handleFormChange('phone_number', e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.phone_number && (
                                        <div className="error-message">
                                            <FaExclamationTriangle />
                                            {formErrors.phone_number}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email Address *</label>
                                    <input
                                        type="email"
                                        className={`form-input ${formErrors.email ? 'error' : ''}`}
                                        placeholder="Enter email address"
                                        value={formData.email}
                                        onChange={(e) => handleFormChange('email', e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.email && (
                                        <div className="error-message">
                                            <FaExclamationTriangle />
                                            {formErrors.email}
                                        </div>
                                    )}
                                </div>

                                {formErrors.submit && (
                                    <div className="error-message" style={{ marginBottom: '20px' }}>
                                        <FaExclamationTriangle />
                                        {formErrors.submit}
                                    </div>
                                )}

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="form-btn secondary"
                                        onClick={() => setShowAddModal(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="form-btn primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <div className="loading-text">
                                                <div className="spinner"></div>
                                                Adding...
                                            </div>
                                        ) : (
                                            <>
                                                <FaPlus />
                                                Add Biker
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

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
