import './Pagination.css';

// Nút chuyển trang: Previous 1 2 3 Next
function Pagination({ page, totalPages, onChange }) {
  const numbers = [];
  for (let i = 1; i <= totalPages; i++) {
    numbers.push(i);
  }

  return (
    <div className="pagination">
      <button className="page-nav" disabled={page === 1} onClick={function () { onChange(page - 1); }}>Previous</button>
      {numbers.map(function (n) {
        return (
          <button key={n} className={n === page ? 'page-num active' : 'page-num'} onClick={function () { onChange(n); }}>
            {n}
          </button>
        );
      })}
      <button className="page-nav" disabled={page === totalPages} onClick={function () { onChange(page + 1); }}>Next</button>
    </div>
  );
}

export default Pagination;
