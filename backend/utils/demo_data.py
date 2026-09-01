# backend/utils/demo_data.py

from typing import Dict, Any

SAMPLE_RESUME = """
Jane Doe
jane.doe@email.com | +1 (555) 019-2834 | github.com/janedoe | linkedin.com/in/janedoe

EDUCATION
Bachelor of Science in Computer Science
University of Technology, GPA: 3.8/4.0 | Expected Graduation: May 2027

TECHNICAL SKILLS
Languages: Python, JavaScript, SQL, HTML/CSS
Frameworks/Libraries: React, Node.js, Express, Flask, Pandas, NumPy
Databases: PostgreSQL, MongoDB
Tools/Developer Platforms: Git, VS Code, Postman
Concepts: RESTful APIs, OOP, Data Structures, Agile Software Development

PROJECTS
AI Chat Bot (Python, Flask, OpenAI API) | Jan 2026 - Present
- Designed and built a chatbot utilizing GPT-3.5 API to provide tutoring help for CS students.
- Managed prompt history using Flask session storage and deployed on Render.
- Integrated MongoDB database to store anonymous user feedback.

E-Commerce Web App (React, Node.js, PostgreSQL) | Sep 2025 - Dec 2025
- Built a responsive full-stack e-commerce store with functional shopping cart.
- Implemented REST endpoints using Express and optimized PostgreSQL queries.
- Styled front-end using Tailwind CSS for clean layout.

EXPERIENCE
Software Engineering Intern | InnovateTech Inc. | Jun 2025 - Aug 2025
- Collaborated in a team of 4 engineers to develop new UI features using React and Tailwind CSS.
- Participated in weekly stand-ups, code reviews, and created documentation.
- Resolved 25+ Jira tickets relating to UI responsiveness bugs.
"""

SAMPLE_JD = """
Junior Software Engineer - Full Stack
Global Solutions Corp. | Remote / Hybrid

CORE RESPONSIBILITIES
- Write clean, maintainable, and well-tested code across the frontend and backend.
- Build responsive UI components using React, Tailwind CSS, and TypeScript.
- Work closely with team members using Git version control and participate in agile sprints.
- Package and deploy applications using Docker containers on AWS (ECS/EKS).

REQUIRED TECHNICAL SKILLS
- Strong programming experience in Python or JavaScript/TypeScript.
- Experience building web applications using React.
- Solid understanding of relational databases, specifically PostgreSQL.

PREFERRED SKILLS & EXPERIENCE
- Knowledge of containerization tools (Docker).
- Exposure to cloud computing services (AWS, Google Cloud).
- Experience with FastAPI (Python) or Express (Node.js).
"""

DEMO_ANALYSIS_RESULT = {
    "candidate_name": "Jane Doe",
    "resume_score": 88,
    "job_match_score": 82,
    "category_scores": {
        "structure": 90,
        "skills": 85,
        "projects": 85,
        "experience": 80,
        "achievements": 75,
        "clarity": 95
    },
    "summary": "Jane Doe shows a strong alignment with the Junior Software Engineer role. She possesses core technical qualifications like React, Python, PostgreSQL, and Git, along with solid internship experience. The main gap lies in her lack of experience with Docker containerization, AWS, and TypeScript, which are preferred or required for the deployment workflow mentioned in the job description.",
    "matched_skills": [
        "Python",
        "JavaScript",
        "React",
        "Node.js",
        "PostgreSQL",
        "Git",
        "RESTful APIs",
        "Tailwind CSS",
        "Postman",
        "HTML/CSS"
    ],
    "skills": ["Python", "JavaScript", "SQL", "React", "Node.js", "Express", "Flask", "Pandas", "NumPy", "PostgreSQL", "MongoDB", "Git", "RESTful APIs", "OOP", "Tailwind CSS"],
    "technical_skills": ["Python", "JavaScript", "SQL", "React", "Node.js", "Express", "Flask", "Pandas", "NumPy", "PostgreSQL", "MongoDB", "Git"],
    "soft_skills": ["Agile Collaboration", "Teamwork", "Communication", "Documentation Writing"],
    "education": ["Bachelor of Science in Computer Science, University of Technology"],
    "projects": [
        "AI Chat Bot (Python, Flask, OpenAI API)",
        "E-Commerce Web App (React, Node.js, PostgreSQL)"
    ],
    "experience": [
        "Software Engineering Intern at InnovateTech Inc. (Jun 2025 - Aug 2025)"
    ],
    "certifications": ["Not mentioned in resume"],
    "strengths": [
        "Strong portfolio projects demonstrating full-stack React and Python Flask implementation.",
        "Relevant industry internship experience at InnovateTech with evidence of ticket resolution and collaboration.",
        "Demonstrated database design skills in both relational (PostgreSQL) and NoSQL (MongoDB) databases.",
        "Familiarity with modern UI development using Tailwind CSS."
    ],
    "weaknesses": [
        "Lacks containerization experience (Docker), which is requested in the job description.",
        "No cloud computing exposure (AWS) listed on the resume.",
        "TypeScript, which is requested for UI development in the JD, is absent."
    ],
    "improvements": [
        "Include explicit mention of automated testing tools/frameworks (like Pytest, Jest) to highlight coding quality.",
        "Incorporate keywords from the JD like 'Docker' and 'TypeScript' by refactoring existing projects and listing them under technical skills.",
        "Revise project descriptions to highlight scale, optimization, and collaboration rather than just lists of tech stacks."
    ],
    "missing_skills": [
        {
            "name": "Docker",
            "priority": "High",
            "why_matters": "The job description mentions packaging and deploying applications using Docker containers. This is a critical skill for their local development and CI/CD setup.",
            "recommended_action": "Learn Docker basics: understand containers vs images, write a Dockerfile for your React/Node.js e-commerce project, and run it locally using Docker Compose."
        },
        {
            "name": "AWS",
            "priority": "Medium",
            "why_matters": "The JD specifies deploying applications on AWS ECS/EKS. Having cloud exposure is highly preferred.",
            "recommended_action": "Sign up for an AWS Free Tier account, study core services (EC2, S3, ECS), and complete a tutorial deploying a containerized application to ECS."
        },
        {
            "name": "TypeScript",
            "priority": "Medium",
            "why_matters": "The company builds responsive UI components using TypeScript. Strong JS foundations are present, but TypeScript familiarity is required to contribute immediately to the codebase.",
            "recommended_action": "Refactor a portion of your React e-commerce frontend from JavaScript to TypeScript, focusing on typing props, state, and API responses."
        }
    ],
    "partial_match_skills": [
        {
            "name": "FastAPI / Node.js Express",
            "gap_description": "Candidate has Express experience, but the JD prefers FastAPI. While Python is in the resume (Flask), API work has mostly been done in Express.",
            "recommended_action": "Build a simple CRUD API using FastAPI and Python, utilizing Pydantic models for validation to show you are comfortable with modern Python APIs."
        },
        {
            "name": "Testing (Pytest/Jest)",
            "gap_description": "The JD requires competency in unit and integration testing. The resume does not explicitly mention testing frameworks or test coverage.",
            "recommended_action": "Write unit tests for your Flask AI chatbot project using Pytest, or Jest tests for your e-commerce backend."
        }
    ],
    "career_roles": [
        "Junior Full-Stack Developer",
        "Frontend Engineer (React)",
        "Backend Developer (Python/Node.js)",
        "Associate Software Engineer"
    ],
    "recommended_projects": [
        {
            "title": "Containerized Microservices API (FastAPI + Docker)",
            "description": "Create a modern REST API using FastAPI. Implement basic CRUD features, package the backend service inside a Docker container, and run it alongside a PostgreSQL container using Docker Compose.",
            "tech_stack": ["FastAPI", "Docker", "PostgreSQL", "Python"],
            "learning_outcome": "Demonstrates FastAPI backend skills and local containerization workflows."
        },
        {
            "title": "TypeScript Portfolio Portal (React + TS)",
            "description": "Develop a personal portfolio website entirely in TypeScript using React and Tailwind CSS. Add strict typings for all React components, hooks, and external API requests.",
            "tech_stack": ["TypeScript", "React", "Tailwind CSS"],
            "learning_outcome": "Proves TypeScript capability and modern front-end styling structures."
        },
        {
            "title": "AWS Cloud Deployer",
            "description": "Deploy your containerized FastAPI project onto AWS using ECS (Elastic Container Service) with Fargate, utilizing an RDS PostgreSQL database instance.",
            "tech_stack": ["AWS ECS", "AWS RDS", "Docker", "CI/CD"],
            "learning_outcome": "Proves understanding of cloud environments, remote databases, and container orchestration."
        }
    ],
    "general_career_advice": "Your resume is in excellent shape for junior full-stack roles. Emphasize your internship accomplishments. When applying to Global Solutions Corp., make sure to reference Docker and TypeScript in your cover letter and state that you are actively building projects to expand your skill set in these technologies.",
    "interview_topics": {
        "stage_1": {
            "topics": ["Resume Walkthrough", "Internship Details", "React Fundamentals"],
            "questions": [
                "Can you walk us through the features of your E-Commerce Web App and the database schema?",
                "What did you do during your internship at InnovateTech to resolve UI responsiveness bugs?"
            ],
            "practice_areas": ["Prepare a 2-minute elevator pitch detailing your background, internship achievements, and project highlights."]
        },
        "stage_2": {
            "topics": ["Python/JS syntax", "PostgreSQL query optimization", "REST API design"],
            "questions": [
                "What is the difference between let, const, and var in JavaScript?",
                "How would you optimize a slow-performing join query in PostgreSQL?",
                "Explain the difference between synchronous and asynchronous route handlers in Python web frameworks."
            ],
            "practice_areas": ["Practice standard SQL query structures and review JS closure/promises concepts."]
        },
        "stage_3": {
            "topics": ["AI Chat Bot System Design", "State Management in React", "Database selection"],
            "questions": [
                "Why did you choose MongoDB instead of PostgreSQL for your AI Chat Bot application?",
                "How did you manage prompt history and prevent unauthorized access to the OpenAI API key?"
            ],
            "practice_areas": ["Create a simple architecture diagram of your AI Chat Bot and be ready to explain the data flow."]
        },
        "stage_4": {
            "topics": ["Conflict resolution", "Adaptability", "Collaboration"],
            "questions": [
                "Describe a situation during your internship or college group project where there was a disagreement. How did you handle it?",
                "How do you handle receiving critical feedback during code reviews?"
            ],
            "practice_areas": ["Write down two stories using the STAR method (Situation, Task, Action, Result) focused on collaboration."]
        },
        "stage_5": {
            "topics": ["Coding Practice", "Mock Full Stack Design"],
            "questions": [
                "Implement a backend route in Flask/FastAPI that retrieves a list of products, allowing filtering by category.",
                "How would you write a simple Dockerfile for a React application?"
            ],
            "practice_areas": ["Do a mock coding challenge on LeetCode/HackerRank, and write a Dockerfile from memory."]
        }
    },
    "three_month_plan": {
        "month_1": {
            "goals": ["Master TypeScript basics", "Learn Docker basics"],
            "topics": ["TypeScript syntax", "Docker containerization", "FastAPI CRUD applications"],
            "tasks": [
                "Complete a TypeScript crash course and rewrite small React components in TS.",
                "Install Docker Desktop, write a Dockerfile, and successfully build and run a container local service."
            ],
            "practice_project": "Containerized FastAPI microservice with a local PostgreSQL server.",
            "expected_outcome": "Competency in writing TypeScript React code and basic local container configuration."
        },
        "month_2": {
            "goals": ["Build advanced projects", "Learn AWS cloud fundamentals"],
            "topics": ["AWS (EC2, S3, ECS)", "Docker Compose multi-container networks", "Automated Testing"],
            "tasks": [
                "Use Docker Compose to link a FastAPI backend container with a PostgreSQL database container.",
                "Write Pytest scripts for your backend endpoint testing, ensuring at least 80% coverage."
            ],
            "practice_project": "Multi-container Full Stack Application (TS React + FastAPI + Postgres) deployed locally with Docker Compose.",
            "expected_outcome": "Proof of ability to develop complex multi-service projects and test them."
        },
        "month_3": {
            "goals": ["Deploy applications to the cloud", "Interview preparation and networking"],
            "topics": ["Cloud deployment", "Resume optimization", "Mock interviews"],
            "tasks": [
                "Deploy the Month 2 containerized project to AWS ECS using Fargate.",
                "Update your resume to feature TS, Docker, and AWS, and practice behavioral/technical questions."
            ],
            "practice_project": "Live portfolio link demonstrating fully deployed containerized apps on AWS.",
            "expected_outcome": "Job-ready candidate profile with visible production-quality projects and strong interview confidence."
        }
    }
}

def get_demo_analysis() -> Dict[str, Any]:
    """Returns the isolated pre-calculated Jane Doe demo analysis."""
    return dict(DEMO_ANALYSIS_RESULT)
