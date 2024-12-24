export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const getPageNumbers = () => {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        if (
          i === 1 || // Luôn hiện trang đầu
          i === totalPages || // Luôn hiện trang cuối
          (i >= currentPage - 1 && i <= currentPage + 1) // Hiện 1 trang trước và sau trang hiện tại
        ) {
          pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
          pages.push('...');
        }
      }
      return pages;
    };
  
    return (
      <div className="flex justify-center items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'border hover:bg-gray-50'
          }`}
        >
          Trước
        </button>
  
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`px-4 py-2 rounded-lg ${
              page === currentPage
                ? 'bg-primary text-white'
                : page === '...'
                ? 'cursor-default'
                : 'border hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
  
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'border hover:bg-gray-50'
          }`}
        >
          Sau
        </button>
      </div>
    );
  };