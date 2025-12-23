import { useEffect } from 'react';

const ScrollingTitle = () => {
  useEffect(() => {
    const titleText = "Accounting Cashier and Consignment ";
    let currentIndex = 0;

    const scrollTitle = () => {
      // Memutar teks judul
      document.title = titleText.substring(currentIndex) + titleText.substring(0, currentIndex);
      currentIndex = (currentIndex + 1) % titleText.length;
    };

    // Mengatur interval untuk kecepatan berjalan (300ms = pelan)
    const intervalId = setInterval(scrollTitle, 300);

    return () => clearInterval(intervalId);
  }, []);

  return null; // Komponen ini tidak merender apa pun ke UI
};

export default ScrollingTitle;