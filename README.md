# Finance Manager Application

## Project Description

Finance Manager is a comprehensive financial management solution designed for both personal users and small businesses. The application provides a complete suite of tools to track, analyze, and manage financial data effectively.

### Key Features

**Core Functionality:**
- **Transaction Recording** - Store and manage all financial transactions with detailed records
- **Financial Accounts Management** - Organize multiple accounts (checking, savings, credit cards, business accounts)
- **Categorization & Tagging** - Intelligent categorization system with custom tags for detailed expense tracking
- **Budget Tracking** - Monitor spending against set budgets and financial goals
- **Financial Reporting** - Generate comprehensive reports for financial analysis

**Premium Features:**
- **Advanced Budgeting** - Enhanced budgeting tools with forecasting and recommendations
- **Detailed Analytics** - In-depth financial analysis with trends and insights
- **Enhanced Categorization** - AI-powered automatic categorization and smart suggestions
- **Advanced Reporting** - Professional-grade reports with customizable templates

**Collaboration Features:**
- **Multi-User Access** - Invite team members or family to collaborate on accounts
- **User Invitations** - Send invitations via email for account sharing
- **Real-time Updates** - Live synchronization of data across all users

### Target Users
- **Personal Users** - Individuals looking to manage personal finances, track expenses, and budget effectively
- **Small Businesses** - Entrepreneurs and small business owners needing comprehensive financial tracking and reporting

## Screenshots

### Landing Page
*Clean and intuitive landing page with overview of key features*
<img height="400px" src="/screeenshots/finance-manager-ui-1.png" width="700px"/>

### Signup and SignIn
<img height="400px" src="/screeenshots/finance-manager-ui-2.png" width="700px"/>
<img height="400px" src="/screeenshots/finance-manager-ui-3.png" width="700px"/>
<img height="400px" src="/screeenshots/finance-manager-ui-4.png" width="700px"/>

### Dashboard Free plan
*Free dashboard provides simple overview of the account*
<img height="400px" src="/screeenshots/finance-manager-ui-5.png" width="700px"/>

### Dashboard Premium plan
*Comprehensive financial dashboard with charts, recent transactions, and account summaries*
<img height="400px" src="/screeenshots/finance-manager-ui-6.png" width="700px"/>

### Financial Account Management
*Add all your financial accounts can give better result.
<img height="400px" src="/screeenshots/finance-manager-ui-7.png" width="700px"/>

### Transaction Management
*Easy-to-use transaction entry form with categorization and tagging*
<img height="400px" src="/screeenshots/finance-manager-ui-8.png" width="700px"/>

### Budget Tracking
*Visual budget tracking with progress bars and spending analysis*
<img height="400px" src="/screeenshots/finance-manager-ui-9.png" width="700px"/>

### Reports & Analytics
*Detailed financial reports with interactive charts and export options*
<img height="400px" src="/screeenshots/finance-manager-ui-10.png" width="700px"/>

### Code Base sample Screenshots
*User invitation and collaboration management interface*
<img height="400px" src="/screeenshots/finance-manager-codebase-1.png" width="700px"/>
<img height="400px" src="/screeenshots/finance-manager-codebase-2.png" width="700px"/>
<img height="400px" src="/screeenshots/finance-manager-codebase-3.png" width="700px"/>


## Technology Stack

### Backend
- **Spring Boot** - Main application framework
- **WebSocket** - Real-time communication for live updates
- **Email Integration** - For user invitations and notifications

### Frontend
- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling and responsive design
- **Bootstrap** - Responsive UI framework
- **JavaScript** - Client-side functionality
- **jQuery** - DOM manipulation and AJAX requests
- **Chart.js** - Interactive charts and data visualization

### Additional Technologies
- **RESTful APIs** - Backend service communication
- **JSON** - Data interchange format
- **Responsive Web Design** - Mobile-first approach
- **Payhere** - Payment gateway

## Setup Instructions

### Prerequisites
Before running the application, ensure you have the following installed:
- **Java 17 or higher**
- **Maven 3.6+**
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Backend Setup (Spring Boot)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/finance-manager.git
   cd finance-manager
   ```

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Configure environment variables**
   ```bash
   # Copy the environment example file
   cp .env.example .env
   
   # Edit the .env file with your actual values
   nano .env
   ```

   See the [Environment Configuration](#environment-configuration) section below for detailed setup instructions.

4. **Configure application properties**
   ```bash
   # Copy the example configuration file
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   
   # Edit the configuration file with your settings
   nano src/main/resources/application.properties
   ```

   Update the following properties:
   ```properties
   # Database Configuration
   spring.datasource.url=jdbc:mysql://localhost:3306/finance_manager
   spring.datasource.username=${DB_USERNAME}
   spring.datasource.password=${DB_PASSWORD}
   
   # Email Configuration
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=${MAIL_USERNAME}
   spring.mail.password=${MAIL_PASSWORD}
   
   # JWT RSA Key Configuration
   jwt.rsa.private-key=classpath:keys/private_key.pem
   jwt.rsa.public-key=classpath:keys/public_key.pem
   jwt.expiration=86400000
   
   # PayHere Payment Gateway
   payhere.merchant.id=${PAYHERE_MERCHANT_ID}
   payhere.merchant.secret=${PAYHERE_MERCHANT_SECRET}
   payhere.sandbox=true
   ```

5. **Generate RSA Key Pair for JWT**
   ```bash
   # Create keys directory
   mkdir -p src/main/resources/keys
   
   # Generate private key
   openssl genpkey -algorithm RSA -out src/main/resources/keys/private_key.pem -pkcs8 -aes256
   
   # Generate public key from private key
   openssl rsa -pubout -in src/main/resources/keys/private_key.pem -out src/main/resources/keys/public_key.pem
   ```

6. **Install dependencies and build**
   ```bash
   mvn clean install
   ```

5. **Run database migrations**
   ```bash
   mvn flyway:migrate
   ```

7. **Start the backend server**
   ```bash
   mvn spring-boot:run
   ```

   The backend server will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install frontend dependencies** (if using npm for asset management)
   ```bash
   npm install
   ```

3. **Configure API endpoints**
   ```bash
   # Edit the configuration file
   nano js/config.js
   ```

   Update the API base URL:
   ```javascript
   const CONFIG = {
       API_BASE_URL: 'http://localhost:8080/api',
       WEBSOCKET_URL: 'ws://localhost:8080/ws'
   };
   ```

4. **Serve the frontend**
   You can serve the frontend using any of these methods:

   **Option A: Using a simple HTTP server**
   ```bash
   # Using Python 3
   python -m http.server 3000
   
   # Using Node.js http-server
   npx http-server -p 3000
   ```

   **Option B: Using Live Server (VS Code extension)**
    - Install Live Server extension in VS Code
    - Right-click on `index.html` and select "Open with Live Server"

   The frontend will be available at `http://localhost:3000`

### Database Setup

1. **Install MySQL** (or your preferred database)
   ```bash
   # On Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   
   # On macOS using Homebrew
   brew install mysql
   ```

2. **Create database**
   ```sql
   mysql -u root -p
   CREATE DATABASE finance_manager;
   CREATE USER 'finance_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON finance_manager.* TO 'finance_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Email Configuration (for invitations)

1. **Gmail Setup**
    - Enable 2-Factor Authentication on your Gmail account
    - Generate an App Password for the application
    - Add the App Password to your `.env` file as `MAIL_PASSWORD`

2. **Other Email Providers**
    - Update SMTP settings in `application.properties` according to your provider

### PayHere Payment Gateway Setup

1. **Create PayHere Account**
    - Sign up at [PayHere](https://www.payhere.lk/)
    - Get your Merchant ID and Merchant Secret from the dashboard

2. **Configure PayHere**
    - Add your `PAYHERE_MERCHANT_ID` and `PAYHERE_MERCHANT_SECRET` to `.env`
    - Set `payhere.sandbox=false` in production

## Environment Configuration

The application uses environment variables for sensitive data. You need to create a `.env` file in the backend directory.

### Setting up .env file

1. **Copy the example file**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your actual values**
   Edit the `.env` file and replace all placeholder values with your actual configuration:

   ```env
   # Database Configuration
   DB_USERNAME=your_database_username
   DB_PASSWORD=your_database_password
   
   # Email Configuration (for invitations and notifications)
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_app_password_or_smtp_password
   
   # PayHere Payment Gateway (for premium subscriptions)
   PAYHERE_MERCHANT_ID=your_payhere_merchant_id
   PAYHERE_MERCHANT_SECRET=your_payhere_merchant_secret
   ```

### Security Notes

- **Never commit your `.env` file to version control**
- The `.env` file should be added to your `.gitignore`
- Use strong, unique passwords for all services
- In production, consider using a secrets management service
- RSA keys should be kept secure and never shared publicly

### Running the Complete Application

1. **Start the backend server**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Start the frontend server** (in a new terminal)
   ```bash
   cd frontend
   python -m http.server 3000
   ```

3. **Access the application**
    - Open your browser and navigate to `http://localhost:3000`
    - The application should load and connect to the backend API

### Troubleshooting

**Common Issues:**

- **CORS Errors**: Ensure the backend CORS configuration allows requests from your frontend URL
- **Database Connection**: Verify database credentials and ensure MySQL service is running
- **Email Not Working**: Check SMTP settings and ensure app passwords are correctly configured
- **WebSocket Issues**: Ensure ports 8080 and 3000 are not blocked by firewall

**Logs:**
- Backend logs: Check console output where Spring Boot is running
- Frontend logs: Use browser developer tools (F12) to check console for errors

## Demo Video

🎥 **Watch the complete application demo:**
[Finance Manager - Complete Feature Walkthrough](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

*The demo video showcases all major features including transaction management, budgeting, reporting, and collaboration features.*

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Search existing [GitHub Issues](https://github.com/yourusername/finance-manager/issues)
3. Create a new issue with detailed information about your problem

## Acknowledgments

- Thanks to the Spring Boot community for excellent documentation
- Chart.js team for the amazing charting library
- Bootstrap team for the responsive framework