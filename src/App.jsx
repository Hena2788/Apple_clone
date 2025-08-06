import { useState } from 'react'
// import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import Header from './components/header/Header.jsx'
import Alert from './components/alert/Alert.jsx'
import Ipodpro from './components/ipod-pro/Ipodpro.jsx' 
import Macbook from './components/MacBook_Air/Macbook.jsx'
import Ipone from './components/Iphone_pro/Ipone.jsx'
import Apple_iphone from './components/apple_iphone/Apple_iphone.jsx'
import Apple_Watch from './components/apple_watch/Apple_Watch.jsx'
import Apple_Arcade from './components/apple_arcade/Apple_Arcade.jsx'
import Footer from './components/footer/Footer.jsx'



function App() {

  return (
    <>
      <Header />
      <Alert />
      <Ipodpro/>
      <Macbook/>
      <Ipone/>
      <Apple_iphone/>
      <Apple_Watch/>
      <Apple_Arcade/>
      <Footer/>
    </>
  )
}

export default App
