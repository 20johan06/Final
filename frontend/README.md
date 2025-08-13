# FitGuide Pro - Sports & Health Excellence

A comprehensive AI-powered fitness website that guides users through exercises and yoga poses with real-time posture correction, voice guidance, and progress tracking.

## 🎯 Target Users

- **Sports Theme**: Youth (ages 15-35) focusing on exercise and diet
- **Health Theme**: Adults above 40-45 years focusing on wellness and yoga

## ✨ Features

### 🏃‍♂️ Sports & Exercise
- **Real-time AI Camera Guidance**: Uses TensorFlow.js for pose detection
- **Voice Instructions**: Provides audio feedback for posture correction
- **Exercise Library**: Push-ups, Squats, Planks, Burpees
- **Form Correction**: Detects incorrect posture and provides specific guidance
- **Rep Counting**: Automatically counts repetitions with perfect form
- **Progress Tracking**: Daily credits, bonus points, and workout history

### 🧘‍♀️ Yoga & Wellness
- **12 Surya Namaskara Poses**: Complete sun salutation sequence
- **Pose Detection**: AI-powered yoga pose analysis
- **Voice Guidance**: Real-time corrections for proper alignment
- **Duration Tracking**: Timed sessions for each pose
- **Benefits Information**: Detailed explanations for each asana

### 📊 Progress & Analytics
- **Daily Credits System**: Earn points for completed workouts
- **Bonus Points**: Additional rewards for perfect form
- **Session Statistics**: Track reps, time, and perfect form count
- **Daily Schedule**: Personalized workout recommendations
- **Progress Persistence**: Data saved locally for continuous tracking

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Camera access for pose detection
- Microphone permissions for voice feedback
- Internet connection for AI model loading

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Allow camera and microphone permissions when prompted
4. Wait for the AI model to load (may take a few seconds)

### Usage

#### Home Page
- **Sports Card**: Click to access exercise library
- **Yoga Card**: Click to access yoga pose library

#### Exercise Session
1. Select an exercise (e.g., Push-ups)
2. Position yourself in front of the camera
3. Follow voice instructions for proper form
4. Complete reps while maintaining correct posture
5. Earn credits and bonus points for perfect form

#### Yoga Session
1. Select a yoga pose (e.g., Vrikshasana)
2. Position yourself in front of the camera
3. Follow voice guidance for proper alignment
4. Hold the pose for the recommended duration
5. Earn credits for maintaining correct form

## 🛠️ Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI Framework**: TensorFlow.js
- **Pose Detection**: MoveNet model
- **Voice Synthesis**: Web Speech API
- **Camera Access**: MediaDevices API
- **Storage**: LocalStorage for progress persistence

### AI Pose Detection
- **Model**: MoveNet (lightweight, real-time pose detection)
- **Keypoints**: 17 body keypoints detection
- **Real-time**: 30+ FPS performance
- **Accuracy**: High precision for fitness applications

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📱 Responsive Design

The website is fully responsive and works on:
- Desktop computers
- Laptops
- Tablets
- Mobile phones

## 🔧 Customization

### Adding New Exercises
1. Add exercise data to the `exercises` object in `script.js`
2. Create pose analysis function in `analyzeExercisePose()`
3. Update UI elements as needed

### Adding New Yoga Poses
1. Add pose data to the `yogaPoses` object in `script.js`
2. Create pose analysis function in `analyzeYogaPose()`
3. Update UI elements as needed

### Styling
- Modify `styles.css` for visual changes
- Update color schemes, fonts, and layouts
- Customize animations and transitions

## 🎨 Design Features

### Visual Elements
- **Modern UI**: Clean, intuitive interface
- **Gradient Backgrounds**: Beautiful color schemes
- **Card-based Layout**: Easy navigation and selection
- **Smooth Animations**: Engaging user experience
- **Icon Integration**: Font Awesome icons throughout

### User Experience
- **Intuitive Navigation**: Clear section organization
- **Visual Feedback**: Color-coded posture indicators
- **Progress Visualization**: Real-time statistics display
- **Responsive Layout**: Works on all device sizes

## 🔒 Privacy & Security

- **Local Processing**: All pose detection happens in the browser
- **No Data Upload**: Personal data stays on your device
- **Camera Access**: Only used for pose detection during active sessions
- **Local Storage**: Progress data stored locally in your browser

## 🚨 Troubleshooting

### Common Issues

#### Camera Not Working
- Check browser permissions
- Ensure camera is not being used by other applications
- Try refreshing the page

#### Pose Detection Issues
- Ensure good lighting
- Position yourself clearly in frame
- Wait for AI model to fully load
- Check browser console for errors

#### Voice Feedback Not Working
- Check microphone permissions
- Ensure system volume is on
- Try refreshing the page

### Performance Tips
- Close unnecessary browser tabs
- Ensure stable internet connection
- Use modern browser versions
- Allow sufficient time for AI model loading

## 📈 Future Enhancements

### Planned Features
- **Social Features**: Share progress with friends
- **Advanced Analytics**: Detailed performance insights
- **Workout Plans**: Personalized training programs
- **Nutrition Guidance**: Diet recommendations
- **Mobile App**: Native mobile application
- **Cloud Sync**: Cross-device progress synchronization

### Technical Improvements
- **Offline Support**: Work without internet connection
- **Progressive Web App**: Install as desktop/mobile app
- **Advanced AI Models**: More accurate pose detection
- **Multi-person Support**: Group workout sessions

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Adding error handling and validation
- Implementing user authentication
- Adding data backup and recovery
- Enhancing security measures
- Optimizing performance for mobile devices

## 📄 License

This project is created for educational and demonstration purposes.

## 🙏 Acknowledgments

- TensorFlow.js team for pose detection models
- Font Awesome for beautiful icons
- Web standards community for modern APIs
- Fitness and yoga communities for pose guidance

---

**Note**: This website requires camera access and works best with good lighting and clear camera positioning. For optimal experience, use a modern browser and ensure your device meets the minimum requirements.
