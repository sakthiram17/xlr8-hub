Certainly! Below is an updated version of the README with additional instructions for setting up the microcontroller, specifically for STM32F411RE:

---

# Power Electronics Converter Monitoring and Control System

This project involves the real-time monitoring and control of a novel high-gain DC-DC converter. The system comprises three main pages within a web application:

## 1. Waveform Visualization
The first page displays real-time waveforms associated with the power electronics converter. These waveforms are fetched from the STM32F411RE microcontroller and are rendered using ReCharts. The data is stored and synchronized through Firebase Realtime Database. The Node.js server acts as an interface between the STM32F411RE and the website, facilitating seamless communication.

## 2. Control Hub
The second page serves as the control hub, allowing users to perform various actions such as soft start, soft stop, change the target voltage, adjust duty ratio, and fine-tune proportional-integral (KP, KI) values. This interactive control interface enhances user flexibility in managing the power electronics converter.

## 3. Outlier Monitoring
The third page provides a comprehensive overview of all outliers and values that exceed predefined limits. Users can easily identify and analyze instances where the system parameters deviate from the expected range. This feature is crucial for monitoring and troubleshooting potential issues with the converter.

## Setup Instructions:

1. **Node.js Server:**
   - Ensure Node.js is installed on your system.
   - Run `npm install` to install the required dependencies.
   - Execute `node server.js` to start the Node.js server.

2. **Firebase Realtime Database:**
   - Set up a Firebase project and obtain the necessary credentials.
   - Configure Firebase in your project by adding the Firebase configuration details.

3. **STM32F411RE Microcontroller:**
   - Ensure that you have the necessary development environment set up for STM32F411RE. This may include installing STM32CubeIDE or other compatible IDEs.
   - Flash the microcontroller with the provided firmware (`firmware.bin` or equivalent) to enable communication with the Node.js server.

4. **Web Application:**
   - Host the web application on a server or use a local server for testing.
   - Access the application through the specified URLs for each page.

5. **Usage:**
   - Open the Waveform Visualization page to monitor real-time waveforms.
   - Navigate to the Control Hub page to perform various control actions.
   - Explore the Outlier Monitoring page to review parameter values exceeding limits.

## Dependencies:

- ReCharts: [Link to ReCharts](https://recharts.org/)
- Firebase Realtime Database: [Link to Firebase](https://firebase.google.com/)
- Node.js: [Link to Node.js](https://nodejs.org/)

Feel free to customize and enhance the code based on your specific requirements. For any issues or inquiries, please contact [Your Contact Information].

--- 

Make sure to replace [Your Contact Information] with your actual contact details. This updated README includes a section for setting up the STM32F411RE microcontroller along with the existing setup instructions.