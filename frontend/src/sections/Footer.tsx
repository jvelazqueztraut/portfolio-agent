export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-10">
          <p className="text-xs text-gray-500">
            Developed by Javier Velazquez Traut. Model by{' '}
            <a 
              href="https://poly.pizza/m/0oBRDJ9Zl9" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline hover:text-gray-300 transition-colors">
                J-Toastie
            </a> /{' '}  
            <a
              href="https://creativecommons.org/licenses/by/3.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-300 transition-colors"
            >
               CC BY 3.0
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
