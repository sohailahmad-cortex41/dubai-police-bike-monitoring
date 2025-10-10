import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import { getData } from '../../api/axios'
import { FaMotorcycle, FaVideo, FaDownload, FaEye, FaCalendar, FaFilter, FaTimes, FaSearch, FaPlay, FaExclamationTriangle, FaCheckCircle, FaClock, FaPlus } from 'react-icons/fa'
import './Rides.css'
import { useAppStore } from '../../../store/appStore'

export default function Rides() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({
        search: '',
        plateNumber: '',
        dateFrom: '',
        dateTo: '',
        processingStatus: ''
    })
    const [bikerInfo, setBikerInfo] = useState(null)

    // Access setRideData from the global store
    const setRideData = useAppStore((state) => state.setRideData)

    const navigate = useNavigate()
    const location = useLocation()

    // Get bikerId from URL parameters
    const urlParams = new URLSearchParams(location.search)
    const bikerId = urlParams.get('bikerId')

    const getRides = async () => {
        if (!bikerId) {
            console.error('No bikerId provided')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const response = await getData(`rides/?biker_id=${bikerId}`)

            if (response?.status === 'success') {
                const ridesData = response.rides || []
                console.log('Rides data:', ridesData)
                setData(ridesData)

                // Set biker info from first ride if available
                if (ridesData.length > 0 && ridesData[0].biker) {
                    setBikerInfo(ridesData[0].biker)
                }
            } else {
                console.error('Failed to fetch rides data:', response?.message)
            }
        } catch (error) {
            console.error('Error fetching rides data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getRides()
    }, [bikerId])

    // Handle adding a new ride
    const handleAddNewRide = () => {
        navigate(`/dashboard?bikerId=${bikerId}&rideId=0`)
        setRideData({});
    }

    // Filtered data based on current filters
    const filteredData = useMemo(() => {
        return data.filter(ride => {
            const matchesSearch = !filters.search ||
                ride.plate_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
                ride.id?.toString().includes(filters.search)

            const matchesPlateNumber = !filters.plateNumber ||
                ride.plate_number?.toLowerCase().includes(filters.plateNumber.toLowerCase())

            const matchesDateFrom = !filters.dateFrom ||
                new Date(ride.created_at) >= new Date(filters.dateFrom)

            const matchesDateTo = !filters.dateTo ||
                new Date(ride.created_at) <= new Date(filters.dateTo)

            const matchesProcessingStatus = !filters.processingStatus ||
                (filters.processingStatus === 'processed' && ride.videos?.some(v => v.annotated_path)) ||
                (filters.processingStatus === 'pending' && ride.videos?.some(v => !v.annotated_path && !v.processed_at)) ||
                (filters.processingStatus === 'processing' && ride.videos?.some(v => !v.annotated_path && v.processed_at))

            return matchesSearch && matchesPlateNumber && matchesDateFrom && matchesDateTo && matchesProcessingStatus
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
            plateNumber: '',
            dateFrom: '',
            dateTo: '',
            processingStatus: ''
        })
    }

    const handleViewDashboard = (rideId, ride = null) => {
        if (ride) {
            setRideData(ride);
        }
        navigate(`/dashboard?bikerId=${bikerId}&rideId=${rideId}`)
    }

    const handleDownloadVideo = async (annotatedPath, videoName = null) => {
        try {
            const encodedPath = encodeURIComponent(annotatedPath)
            const downloadUrl = `http://0.0.0.0:5455/download-video/?file_path=${encodedPath}`

            // Create a temporary link and trigger download
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = videoName || annotatedPath.split('/').pop() // Use provided name or extract from path
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Error downloading video:', error)
        }
    }

    const handleDownloadAllVideos = async (videos) => {
        const annotatedVideos = videos.filter(v => v.annotated_path)

        if (annotatedVideos.length === 0) {
            console.warn('No processed videos available for download')
            return
        }

        // Download all videos with a small delay between each to avoid overwhelming the server
        for (let i = 0; i < annotatedVideos.length; i++) {
            const video = annotatedVideos[i]
            setTimeout(() => {
                handleDownloadVideo(video.annotated_path, video.video_name)
            }, i * 500) // 500ms delay between downloads
        }
    }

    const getVideoTypeIcon = (videoName) => {
        if (videoName?.toLowerCase().includes('front')) {
            return <FaVideo className="video-type-icon front" title="Front Camera" />
        } else if (videoName?.toLowerCase().includes('back')) {
            return <FaVideo className="video-type-icon back" title="Back Camera" />
        }
        return <FaVideo className="video-type-icon" />
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

    const getProcessingStatus = (videos) => {
        if (!videos || videos.length === 0) return 'no-videos'

        const hasAnnotated = videos.some(v => v.annotated_path)
        const hasProcessed = videos.some(v => v.processed_at)

        if (hasAnnotated) return 'processed'
        if (hasProcessed) return 'processing'
        return 'pending'
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processed': return <FaCheckCircle className="status-icon processed" />
            case 'processing': return <FaClock className="status-icon processing" />
            case 'pending': return <FaExclamationTriangle className="status-icon pending" />
            default: return <FaExclamationTriangle className="status-icon no-videos" />
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'processed': return 'Processed'
            case 'processing': return 'Processing'
            case 'pending': return 'Pending'
            default: return 'No Videos'
        }
    }

    if (loading) {
        return (
            <div>
                <DashboardHeader />
                <div className="rides-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!bikerId) {
        return (
            <div>
                <DashboardHeader />
                <div className="rides-container">
                    <div className="error-container">
                        <FaExclamationTriangle className="error-icon" />
                        <h3>No Biker Selected</h3>
                        <p>Please select a biker to view their rides.</p>
                        <button onClick={() => navigate('/bikers')} className="back-btn">
                            Go to Bikers
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <DashboardHeader />
            <div className="rides-container">
                {/* Header Wrapper */}
                <div className="rides-header-wrapper">
                    <div className="header-actions">
                        <div>
                            <div className="rides-header">
                                <h1 className="rides-title">
                                    <FaMotorcycle />
                                    Rides History
                                </h1>
                                <p className="rides-subtitle">
                                    {bikerInfo ? `${bikerInfo.name}'s riding history and video recordings` : 'View riding history and video recordings'}
                                </p>
                                {bikerInfo && (
                                    <div className="biker-info">
                                        <span className="biker-name">{bikerInfo.name}</span>
                                        <span className="biker-details">ID: {bikerInfo.id} | {bikerInfo.phone_number}</span>
                                    </div>
                                )}
                            </div>
                            <div className="action-buttons">
                                <button
                                    className={`toggle-filters-btn ${showFilters ? 'active' : ''}`}
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <FaFilter />
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                </button>
                                <button
                                    className="back-to-bikers-btn"
                                    onClick={() => navigate('/bikers')}
                                >
                                    <FaMotorcycle />
                                    Back to Bikers
                                </button>
                                <button
                                    className="add-new-ride-btn"
                                    onClick={handleAddNewRide}
                                >
                                    <FaPlus />
                                    Add New Ride
                                </button>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="rides-stats">
                            <div className="stat-item">
                                <div className="stat-number">{data.length}</div>
                                <div className="stat-label">Total Rides</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{filteredData.length}</div>
                                <div className="stat-label">Filtered Results</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">
                                    {data.filter(ride => ride.videos?.some(v => v.annotated_path)).length}
                                </div>
                                <div className="stat-label">Processed</div>
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
                            <label className="filter-label">Search (Plate Number or ID)</label>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="Search by plate number or ride ID..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Plate Number</label>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="Filter by plate number..."
                                value={filters.plateNumber}
                                onChange={(e) => handleFilterChange('plateNumber', e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Processing Status</label>
                            <select
                                className="filter-input"
                                value={filters.processingStatus}
                                onChange={(e) => handleFilterChange('processingStatus', e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="processed">Processed</option>
                                <option value="processing">Processing</option>
                                <option value="pending">Pending</option>
                            </select>
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

                {/* Rides Grid */}
                {filteredData.length === 0 ? (
                    <div className="no-rides">
                        <FaSearch className="no-rides-icon" />
                        <h3 className="no-rides-title">
                            {data.length === 0 ? 'No Rides Found' : 'No Results Found'}
                        </h3>
                        <p className="no-rides-subtitle">
                            {data.length === 0
                                ? 'This biker has no recorded rides yet.'
                                : 'Try adjusting your filters to find more results.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="rides-grid">
                        {filteredData.map((ride) => {
                            const processingStatus = getProcessingStatus(ride.videos)
                            const hasAnnotatedVideo = ride.videos?.some(v => v.annotated_path)

                            return (
                                <div key={ride.id} className="ride-card">
                                    <div className="ride-header">
                                        <div className="ride-avatar">
                                            <FaMotorcycle />
                                        </div>
                                        <div className="ride-basic-info">
                                            <h3 className="ride-plate">{ride.plate_number}</h3>
                                            <span className="ride-id">Ride ID: {ride.id}</span>
                                        </div>
                                        <div className="processing-status">
                                            {getStatusIcon(processingStatus)}
                                            <span className={`status-text ${processingStatus}`}>
                                                {getStatusText(processingStatus)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="ride-details">
                                        <div className="ride-detail">
                                            <FaCalendar className="detail-icon" />
                                            <span className="detail-text">
                                                Created: {formatDate(ride.created_at)}
                                            </span>
                                        </div>

                                        <div className="ride-detail">
                                            <FaVideo className="detail-icon" />
                                            <span className="detail-text">
                                                Videos: {ride.videos?.length || 0}
                                            </span>
                                        </div>

                                        {ride.videos && ride.videos.length > 0 && (
                                            <div className="video-info">
                                                <div className="video-header">
                                                    <span className="video-section-title">Video Files ({ride.videos.length})</span>
                                                </div>
                                                {ride.videos.map((video, index) => (
                                                    <div key={video.id} className="video-item">
                                                        <div className="video-main-info">
                                                            <div className="video-name-row">
                                                                {getVideoTypeIcon(video.video_name)}
                                                                <span className="video-name" title={video.video_name}>
                                                                    {video.video_name}
                                                                </span>
                                                            </div>
                                                            <div className="video-status">
                                                                {video.annotated_path ? (
                                                                    <span className="processed-time">
                                                                        <FaCheckCircle className="status-mini-icon" />
                                                                        Processed: {formatDate(video.processed_at)}
                                                                    </span>
                                                                ) : video.processed_at ? (
                                                                    <span className="processing-time">
                                                                        <FaClock className="status-mini-icon" />
                                                                        Processing completed: {formatDate(video.processed_at)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="pending-status">
                                                                        <FaExclamationTriangle className="status-mini-icon" />
                                                                        Processing pending
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {video.annotated_path && (
                                                            <button
                                                                className="individual-download-btn"
                                                                onClick={() => handleDownloadVideo(video.annotated_path, video.video_name)}
                                                                title="Download this video"
                                                            >
                                                                <FaDownload />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="ride-actions">
                                        <button
                                            className="action-btn view-btn"
                                            onClick={() => handleViewDashboard(ride?.id, ride)}
                                            title="View in dashboard"
                                        >
                                            <FaEye />
                                            <span>View Dashboard</span>
                                        </button>

                                        {hasAnnotatedVideo && (
                                            <>
                                                {ride.videos.filter(v => v.annotated_path).length > 1 ? (
                                                    <button
                                                        className="action-btn download-btn"
                                                        onClick={() => handleDownloadAllVideos(ride.videos)}
                                                        title="Download all processed videos"
                                                    >
                                                        <FaDownload />
                                                        <span>Download All ({ride.videos.filter(v => v.annotated_path).length})</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="action-btn download-btn"
                                                        onClick={() => {
                                                            const annotatedVideo = ride.videos.find(v => v.annotated_path)
                                                            if (annotatedVideo) {
                                                                handleDownloadVideo(annotatedVideo.annotated_path, annotatedVideo.video_name)
                                                            }
                                                        }}
                                                        title="Download processed video"
                                                    >
                                                        <FaDownload />
                                                        <span>Download Video</span>
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
