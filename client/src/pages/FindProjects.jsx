import React, { useState } from 'react';

const FindProjects = () => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [projectType, setProjectType] = useState('all');
  const [experienceLevel, setExperienceLevel] = useState({
    entry: true,
    intermediate: true,
    expert: true
  });
  const [clientHistory, setClientHistory] = useState({
    noHires: false,
    fewHires: true,
    manyHires: true
  });
  const [budget, setBudget] = useState(5000);
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(5000);
  const [skills, setSkills] = useState({
    webDev: true,
    mobileDev: true,
    uiUx: false,
    contentWriting: false,
    digitalMarketing: false
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');

  // Mock project data
  const projectsList = [
    {
      id: 1,
      title: "React Native Developer for Mobile App",
      postedAgo: "2 hours ago",
      price: "$2,500 - $5,000",
      timeline: "2-4 weeks",
      level: "Intermediate",
      priceType: "Fixed Price",
      description: "We are looking for a React Native developer to build a cross-platform mobile application for our fitness startup. The app will include user authentication, workout tracking, and social features. Experience with Redux and Firebase is required.",
      skills: ["React Native", "JavaScript", "Firebase", "Redux", "UI/UX"],
      clientCountry: "United States",
      clientRating: 4.9,
      saved: false
    },
    {
      id: 2,
      title: "WordPress Website Redesign",
      postedAgo: "5 hours ago",
      price: "$1,000 - $1,500",
      timeline: "1-2 weeks",
      level: "Entry Level",
      priceType: "Fixed Price",
      description: "We need a WordPress developer to redesign our existing company website. The site should be mobile-responsive and optimized for performance. You'll be working with our design team who will provide the mockups.",
      skills: ["WordPress", "PHP", "HTML/CSS", "JavaScript", "Responsive Design"],
      clientCountry: "Canada",
      clientRating: 4.2,
      saved: false
    },
    {
      id: 3,
      title: "Data Analysis and Visualization Expert",
      postedAgo: "1 day ago",
      price: "$50 - $65 / hr",
      timeline: "3+ months",
      level: "Expert",
      priceType: "Hourly Rate",
      description: "We're seeking a data analyst to help us analyze customer behavior data and create insightful dashboards. You should be proficient in Python, R, or similar tools and have experience with data visualization libraries. Knowledge of machine learning is a plus.",
      skills: ["Python", "R", "Data Visualization", "Tableau", "Machine Learning"],
      clientCountry: "Germany",
      clientRating: 5.0,
      saved: false
    },
    {
      id: 4,
      title: "Content Writer for Tech Blog",
      postedAgo: "2 days ago",
      price: "$25 - $35 / hr",
      timeline: "Ongoing",
      level: "Intermediate",
      priceType: "Hourly Rate",
      description: "We're looking for a content writer with knowledge of technology trends to create engaging blog posts for our B2B SaaS company. Topics will include AI, cloud computing, cybersecurity, and digital transformation. Must have excellent research skills.",
      skills: ["Content Writing", "SEO", "Technology", "Blog Writing", "Research"],
      clientCountry: "Australia",
      clientRating: 4.7,
      saved: false
    }
  ];

  // Handler for saving a project
  const toggleSaveProject = (id) => {
    // In a real app, this would interact with your state management or API
    console.log(`Project ${id} save toggled`);
  };

  // Handler for applying to a project
  const applyToProject = (id) => {
    // In a real app, this would navigate to application page or open modal
    console.log(`Applying to project ${id}`);
  };

  // Handler for resetting filters
  const resetFilters = () => {
    setSearchTerm('');
    setProjectType('all');
    setExperienceLevel({
      entry: true,
      intermediate: true,
      expert: true
    });
    setClientHistory({
      noHires: false,
      fewHires: true,
      manyHires: true
    });
    setBudget(5000);
    setMinBudget(0);
    setMaxBudget(5000);
    setSkills({
      webDev: true,
      mobileDev: true,
      uiUx: false,
      contentWriting: false,
      digitalMarketing: false
    });
  };

  return (
    <div className="bg-[#0F172A] min-h-screen text-[#F8FAFC]">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:w-72 bg-[#1E293B] rounded-lg shadow-md p-6 h-fit border border-[#3EDBD3]/20">
            <div className="relative mb-6">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">🔍</span>
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 bg-[#0B1120] border border-[#3EDBD3]/30 rounded-lg focus:outline-none focus:border-[#3EDBD3] text-[#F8FAFC]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Project Type</h3>
                <span className="text-sm cursor-pointer">▼</span>
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="project-type"
                    checked={projectType === 'all'}
                    onChange={() => setProjectType('all')}
                    className="mr-2"
                  />
                  <span>All projects</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="project-type"
                    checked={projectType === 'fixed'}
                    onChange={() => setProjectType('fixed')}
                    className="mr-2"
                  />
                  <span>Fixed price</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="project-type"
                    checked={projectType === 'hourly'}
                    onChange={() => setProjectType('hourly')}
                    className="mr-2"
                  />
                  <span>Hourly rate</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Experience Level</h3>
                <span className="text-sm cursor-pointer">▼</span>
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={experienceLevel.entry}
                    onChange={() => setExperienceLevel({...experienceLevel, entry: !experienceLevel.entry})}
                    className="mr-2"
                  />
                  <span>Entry Level</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={experienceLevel.intermediate}
                    onChange={() => setExperienceLevel({...experienceLevel, intermediate: !experienceLevel.intermediate})}
                    className="mr-2"
                  />
                  <span>Intermediate</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={experienceLevel.expert}
                    onChange={() => setExperienceLevel({...experienceLevel, expert: !experienceLevel.expert})}
                    className="mr-2"
                  />
                  <span>Expert</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Client History</h3>
                <span className="text-sm cursor-pointer">▼</span>
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={clientHistory.noHires}
                    onChange={() => setClientHistory({...clientHistory, noHires: !clientHistory.noHires})}
                    className="mr-2"
                  />
                  <span>No hires yet</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={clientHistory.fewHires}
                    onChange={() => setClientHistory({...clientHistory, fewHires: !clientHistory.fewHires})}
                    className="mr-2"
                  />
                  <span>1-9 hires</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={clientHistory.manyHires}
                    onChange={() => setClientHistory({...clientHistory, manyHires: !clientHistory.manyHires})}
                    className="mr-2"
                  />
                  <span>10+ hires</span>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Budget</h3>
                <span className="text-sm cursor-pointer">▼</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full mb-4"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minBudget}
                  onChange={(e) => setMinBudget(parseInt(e.target.value))}
                  className="w-full p-2 bg-[#0B1120] border border-[#3EDBD3]/30 rounded text-[#F8FAFC]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Skills</h3>
                <span className="text-sm cursor-pointer">▼</span>
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={skills.webDev}
                    onChange={() => setSkills({...skills, webDev: !skills.webDev})}
                    className="mr-2"
                  />
                  <span>Web Development</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={skills.mobileDev}
                    onChange={() => setSkills({...skills, mobileDev: !skills.mobileDev})}
                    className="mr-2"
                  />
                  <span>Mobile App Development</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={skills.uiUx}
                    onChange={() => setSkills({...skills, uiUx: !skills.uiUx})}
                    className="mr-2"
                  />
                  <span>UI/UX Design</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={skills.contentWriting}
                    onChange={() => setSkills({...skills, contentWriting: !skills.contentWriting})}
                    className="mr-2"
                  />
                  <span>Content Writing</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={skills.digitalMarketing}
                    onChange={() => setSkills({...skills, digitalMarketing: !skills.digitalMarketing})}
                    className="mr-2"
                  />
                  <span>Digital Marketing</span>
                </label>
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-[#3EDBD3] to-[#4A7BF7] text-[#0F172A] py-2 rounded font-medium hover:opacity-90 transition-opacity"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="w-full text-[#3EDBD3] py-2 mt-2 font-medium hover:underline"
            >
              Reset All
            </button>
          </aside>

          {/* Projects Section */}
          <section className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="text-lg font-semibold mb-4 sm:mb-0">
                528 projects found
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:items-center w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 bg-[#0B1120] border border-[#3EDBD3]/30 rounded text-[#F8FAFC]"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest First</option>
                    <option value="budget-high">Budget: High to Low</option>
                    <option value="budget-low">Budget: Low to High</option>
                  </select>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 border border-[#3EDBD3]/30 rounded ${viewMode === 'grid' ? 'bg-[#3EDBD3]/20 text-[#3EDBD3]' : 'text-[#94A3B8]'}`}
                  >
                    🔲
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 border border-[#3EDBD3]/30 rounded ${viewMode === 'list' ? 'bg-[#3EDBD3]/20 text-[#3EDBD3]' : 'text-[#94A3B8]'}`}
                  >
                    📝
                  </button>
                </div>
              </div>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
              {projectsList.map(project => (
                <div key={project.id} className="bg-[#1E293B] rounded-lg shadow-md p-6 hover:translate-y-[-2px] transition-transform border border-[#3EDBD3]/10">
                  <div className="flex flex-col sm:flex-row justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#3EDBD3] mb-1">{project.title}</h3>
                      <p className="text-[#94A3B8]">Posted {project.postedAgo}</p>
                    </div>
                    <div className="text-[#FF6EC7] font-semibold mt-2 sm:mt-0">
                      {project.price}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-[#94A3B8] text-sm mb-4">
                    <span className="flex items-center gap-1">⏱️ {project.timeline}</span>
                    <span className="flex items-center gap-1">👨‍💼 {project.level}</span>
                    <span className="flex items-center gap-1">💵 {project.priceType}</span>
                  </div>

                  <p className="mb-4">{project.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.map((skill, index) => (
                      <span key={index} className="bg-[#0B1120] px-3 py-1 rounded text-sm border border-[#4A7BF7]/30 text-[#4A7BF7]">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-[#3EDBD3]/10">
                    <div className="text-sm mb-4 sm:mb-0">
                      <span>Client from {project.clientCountry}</span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <span>{'★'.repeat(Math.round(project.clientRating))}</span>
                        <span>{project.clientRating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <button
                        onClick={() => toggleSaveProject(project.id)}
                        className="text-xl text-[#94A3B8] hover:text-[#FF6EC7] mr-4"
                      >
                        {project.saved ? '❤️' : '♡'}
                      </button>
                      <button
                        onClick={() => applyToProject(project.id)}
                        className="bg-gradient-to-r from-[#3EDBD3] to-[#4A7BF7] text-[#0F172A] px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8 gap-1">
              <button className="w-10 h-10 border border-[#3EDBD3]/30 rounded flex items-center justify-center hover:bg-[#0B1120] text-[#94A3B8]">
                ←
              </button>
              <button className="w-10 h-10 border border-[#3EDBD3] rounded flex items-center justify-center bg-gradient-to-r from-[#3EDBD3] to-[#4A7BF7] text-[#0F172A]">
                1
              </button>
              <button className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100">
                2
              </button>
              <button className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100">
                3
              </button>
              <button className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100">
                4
              </button>
              <button className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100">
                5
              </button>
              <button className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100">
                →
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FindProjects;