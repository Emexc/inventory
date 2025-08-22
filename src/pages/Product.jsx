import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiDownload,
  FiEye,
  FiTag,
  FiBox,
  FiDollarSign,
  FiTrendingUp,
  FiArchive,
  FiHome,
  FiPackage,
  FiList,
  FiPieChart,
  FiLogOut,
  FiUser,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { useData } from "../context/context";


const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    totalValue: 0,
  });

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  const { items } = useData();


  // Sample product data
  useEffect(() => {

    setProducts(items);
    setFilteredProducts(items);

    // Calculate initial stats
    updateStatistics(items);
  }, []);

  // Update statistics
  const updateStatistics = (products) => {
    setStats({
      totalProducts: products.length,
      inStock: products.filter((p) => p.status === "In Stock").length,
      lowStock: products.filter((p) => p.status === "Low Stock").length,
      totalValue: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
    });
  };

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      result = result.filter((product) => product.status === selectedStatus);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredProducts(result);
    updateStatistics(result);
  }, [products, searchTerm, selectedCategory, selectedStatus, sortConfig]);

  // Handle sort request
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // View product details
  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                className="md:hidden mr-4 text-gray-500"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              <h1 className="text-xl font-bold text-blue-600">
                Inventory Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <div className="relative group flex items-center space-x-2">
                {/* Badge with subtle glow and transition */}
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all duration-200">
                  <FiUser size={16} className="opacity-90" />

                  {/* Admin crown indicator (small) */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg
                      width="8"
                      height="6"
                      viewBox="0 0 12 8"
                      fill="none"
                      className="text-yellow-800"
                    >
                      <path
                        d="M6 0L11.1962 7.5H0.803848L6 0Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>

                {/* Text with better typography */}
                <span className="hidden md:inline text-sm font-semibold text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-md transition-all duration-200 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar - Mobile */}
          {isMobileMenuOpen && (
            <div className="md:hidden mb-6 bg-white rounded-lg shadow p-4">
              <nav>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 rounded hover:bg-blue-50"
                    >
                      <FiHome className="mr-2" /> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/products"
                      className="flex items-center px-4 py-2 text-blue-600 font-medium rounded bg-blue-50"
                    >
                      <FiPackage className="mr-2" /> Products
                    </Link>
                  </li>
                  {/* <li>
                    <Link
                      to="/categories"
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 rounded hover:bg-blue-50"
                    >
                      <FiList className="mr-2" /> Categories
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reports"
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 rounded hover:bg-blue-50"
                    >
                      <FiPieChart className="mr-2" /> Reports
                    </Link>
                  </li> */}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-left text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded transition-colors duration-200"
                    >
                      <FiLogOut className="mr-2 flex-shrink-0" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {/* Sidebar - Desktop */}
          <div className="hidden md:block md:w-64 pr-6">
            <div className="bg-white rounded-lg shadow p-4 sticky top-6">
              <nav>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 rounded hover:bg-blue-50"
                    >
                      <FiHome className="mr-2" /> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/products"
                      className="flex items-center px-4 py-2 text-blue-600 font-medium rounded bg-blue-50"
                    >
                      <FiPackage className="mr-2" /> Products
                    </Link>
                  </li>
                  {/* <li>
                    <Link
                      to="/categories"
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 rounded hover:bg-blue-50"
                    >
                      <FiList className="mr-2" /> Categories
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reports"
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 rounded hover:bg-blue-50"
                    >
                      <FiPieChart className="mr-2" /> Reports
                    </Link>
                  </li> */}
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded transition-colors duration-200"
                  >
                    <FiLogOut className="mr-2 flex-shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Product Inventory
                </h2>
                <p className="text-gray-600">
                  Manage your product catalog and stock levels
                </p>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <FiBox size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Products</p>
                    <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <FiTrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">In Stock</p>
                    <p className="text-2xl font-bold">{stats.inStock}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                    <FiArchive size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Low Stock</p>
                    <p className="text-2xl font-bold">{stats.lowStock}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <FiDollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Value</p>
                    <p className="text-2xl font-bold">
                      ${stats.totalValue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiTag className="text-gray-400" />
                  </div>
                  <select
                    className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {[...new Set(products.map((p) => p.category))].map(
                      (category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBox className="text-gray-400" />
                  </div>
                  <select
                    className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-md ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-md ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300"
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* Products Display */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FiBox className="text-gray-400" size={48} />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg truncate">
                          {product.name}
                        </h3>
                        <span className="text-blue-600 font-bold">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">
                        {product.sku}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(
                            product.status
                          )}`}
                        >
                          {product.status}
                        </span>
                        <span className="text-gray-700">
                          Qty: {product.quantity}
                        </span>
                      </div>
                      {/* <div className="mt-4 flex justify-between">
                        <button
                          onClick={() => viewProductDetails(product)}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <FiEye className="mr-1" /> View
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/products/edit/${product.id}`)
                            }
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <FiEdit2 />
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            <FiTrash2 />
                          </button>
                        </div>
                      </div> */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("name")}
                      >
                        <div className="flex items-center">
                          Product
                          {sortConfig.key === "name" &&
                            (sortConfig.direction === "asc" ? (
                              <FiChevronUp className="ml-1" />
                            ) : (
                              <FiChevronDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("category")}
                      >
                        <div className="flex items-center">
                          Category
                          {sortConfig.key === "category" &&
                            (sortConfig.direction === "asc" ? (
                              <FiChevronUp className="ml-1" />
                            ) : (
                              <FiChevronDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("price")}
                      >
                        <div className="flex items-center">
                          Price
                          {sortConfig.key === "price" &&
                            (sortConfig.direction === "asc" ? (
                              <FiChevronUp className="ml-1" />
                            ) : (
                              <FiChevronDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("quantity")}
                      >
                        <div className="flex items-center">
                          Qty
                          {sortConfig.key === "quantity" &&
                            (sortConfig.direction === "asc" ? (
                              <FiChevronUp className="ml-1" />
                            ) : (
                              <FiChevronDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          {sortConfig.key === "status" &&
                            (sortConfig.direction === "asc" ? (
                              <FiChevronUp className="ml-1" />
                            ) : (
                              <FiChevronDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                              {product.image ? (
                                <img
                                  className="h-full w-full object-cover rounded-md"
                                  src={product.image}
                                  alt={product.name}
                                />
                              ) : (
                                <FiBox className="text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.supplier}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(
                              product.status
                            )}`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => viewProductDetails(product)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/products/edit/${product.id}`)
                            }
                            className="text-gray-600 hover:text-gray-900 mr-4"
                          >
                            <FiEdit2 />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <FiBox className="mx-auto text-gray-400" size={48} />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No products found
                </h3>
                <p className="mt-1 text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedStatus("all");
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {isDetailModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800">
                Product Details
              </h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <MdClose size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    {selectedProduct.image ? (
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <FiBox className="text-gray-400" size={48} />
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedProduct.name}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(
                        selectedProduct.status
                      )}`}
                    >
                      {selectedProduct.status}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      {selectedProduct.category}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      SKU: {selectedProduct.sku}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="text-lg font-bold">
                        ${selectedProduct.price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cost</p>
                      <p className="text-lg font-bold">
                        ${selectedProduct.cost.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="text-lg font-bold">
                        {selectedProduct.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Supplier</p>
                      <p className="text-lg font-bold">
                        {selectedProduct.supplier}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div className="text-sm text-gray-500">
                    Last updated: {selectedProduct.lastUpdated}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  navigate(`/products/edit/${selectedProduct.id}`);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
