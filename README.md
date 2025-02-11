# Audio-Smith

## Overview
Audio-Smith is a web application that allows users to interact with multiple AI models seamlessly. It consists of three main components:
- **Backend**: Built using Express.js and Node.js for handling API requests and managing the AI models
- **Frontend**: Developed using Vite, React.js, TailwindCSS, and JavaScript for an interactive user interface
- **Python Module**: Contains AI model implementations and logic for processing user inputs

## Features
- Select and switch between multiple AI models dynamically
- Interactive UI with real-time responses
- API integration for seamless communication between frontend and backend
- Python-powered AI model processing

## Tech Stack
### Backend:
- Node.js
- Express.js
- REST API

### Frontend:
- Vite
- React.js
- TailwindCSS
- JavaScript

### AI Model Processing:
- Python
- AI/ML Libraries (e.g., TensorFlow, PyTorch, OpenAI API, etc.)


## Installation
### Prerequisites
Ensure you have the following installed:
- Node.js & npm
- Python 3.x & pip
- Vite

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   npm install
   node server.js
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Python Module Setup
1. Navigate to the `python` directory:
   ```bash
   cd python
   pip install -r requirements.txt
   python main.py
   ```

## Usage
### Backend API

## Usage
1. Start the backend server at `http://localhost:5000`
2. Run the frontend using Vite
3. Execute the Python script for AI model processing
4. Access the application in the browser at `http://localhost:5173/`

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/models` | Get available AI models |
| POST   | `/api/select` | Select an AI model |
| POST   | `/api/process` | Send input to AI model |

## Contributing
1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature-branch`
5. Submit a pull request

## License
This project is licensed under the MIT License.


