import React, { useState } from 'react'

const Certifications = ({ onNext }) => {
  const [formData, setFormData] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expirationDate: '',
    credentialId: '',
    credentialURL: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Certification submitted:', formData);
    // Submit the final form data
    onNext(formData);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Certifications</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Certificate Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Certificate Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., AWS Certified Solutions Architect"
              required
            />
          </div>
          
          {/* Issuing Organization */}
          <div>
            <label htmlFor="issuingOrganization" className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
            <input
              type="text"
              id="issuingOrganization"
              name="issuingOrganization"
              value={formData.issuingOrganization}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Amazon Web Services"
              required
            />
          </div>
        </div>
        
        {/* Date Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input
              type="date"
              id="issueDate"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="YYYY-MM-DD"
              required
            />
          </div>
          
          <div>
            <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
            <input
              type="date"
              id="expirationDate"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="YYYY-MM-DD"
            />
          </div>
        </div>
        
        {/* Credential ID */}
        <div className="mt-6">
          <label htmlFor="credentialId" className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
          <input
            type="text"
            id="credentialId"
            name="credentialId"
            value={formData.credentialId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., ABC123XYZ"
          />
        </div>
        
        {/* Credential URL */}
        <div className="mt-6">
          <label htmlFor="credentialURL" className="block text-sm font-medium text-gray-700 mb-1">Credential URL</label>
          <input
            type="url"
            id="credentialURL"
            name="credentialURL"
            value={formData.credentialURL}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://www.example.com/verify/ABC123XYZ"
          />
        </div>
        
        <div className="mt-8">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Profile
          </button>
        </div>
      </form>
    </div>
  )
}

export default Certifications 