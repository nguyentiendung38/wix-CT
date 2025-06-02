// Tham chiếu API Velo: https://www.wix.com/velo/reference/api-overview/introduction
import wixStores from 'wix-stores';
import wixWindow from 'wix-window';

$w.onReady(function () {
    // Tải sản phẩm khi trang sẵn sàng
    loadProducts();

    // Thiết lập sự kiện click cho repeater (nếu cần xử lý khi click vào toàn bộ item)
    $w("#productsRepeater").onItemReady(($item, itemData, index) => {
        // Thiết lập dữ liệu cho từng item trong repeater
        $item("#productNameText").text = itemData.name;
        $item("#productImage").src = itemData.mainMedia; // Hoặc itemData.mediaItems[0].src tùy cấu hình sản phẩm
        $item("#productPriceText").text = itemData.formattedPrice; // Hiển thị giá đã định dạng

        // Xử lý sự kiện khi nhấp vào nút "Thêm vào giỏ hàng"
        $item("#addToCartButton").onClick(async (event) => {
            try {
                await wixStores.cart.addProduct(itemData._id, 1); // Thêm 1 sản phẩm với ID của itemData
                console.log(`Sản phẩm "${itemData.name}" đã được thêm vào giỏ hàng.`);
                wixWindow.openLightbox("Thông báo thêm giỏ hàng", { // Mở lightbox thông báo (tạo lightbox này trước)
                    productName: itemData.name
                });
                // Hoặc cập nhật trực tiếp icon giỏ hàng
                // updateCartIconCount(); // Bạn cần tự viết hàm này
            } catch (error) {
                console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
                wixWindow.openLightbox("Lỗi", { // Mở lightbox báo lỗi (tạo lightbox này trước)
                    errorMessage: "Đã có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng."
                });
            }
        });

        // (Tùy chọn) Xử lý khi nhấp vào hình ảnh sản phẩm để xem chi tiết
        $item("#productImage").onClick(() => {
            wixWindow.openModal(itemData.productPageUrl); // Mở trang chi tiết sản phẩm trong modal
            // Hoặc chuyển hướng đến trang chi tiết sản phẩm:
            // wixLocation.to(itemData.productPageUrl);
        });
    });
});

// Hàm để tải và hiển thị sản phẩm
async function loadProducts() {
    try {
        // Lấy danh sách sản phẩm từ Wix Stores (ví dụ: 20 sản phẩm đầu tiên)
        // Bạn có thể tùy chỉnh query để lọc, sắp xếp sản phẩm
        const results = await wixStores.products
            .queryProducts()
            .limit(20) // Giới hạn số lượng sản phẩm tải
            // .startsWith("name", "Áo") // Ví dụ: lọc sản phẩm có tên bắt đầu bằng "Áo"
            // .ascending("price") // Ví dụ: sắp xếp theo giá tăng dần
            .find();

        if (results.items.length > 0) {
            $w("#productsRepeater").data = results.items; // Gán dữ liệu sản phẩm cho repeater
            $w("#productsRepeater").expand(); // Hiển thị repeater nếu nó bị ẩn ban đầu
        } else {
            console.log("Không tìm thấy sản phẩm nào.");
            // (Tùy chọn) Hiển thị thông báo không có sản phẩm
            // $w("#noProductsText").show(); // Giả sử bạn có một text element tên là noProductsText
        }
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        // (Tùy chọn) Hiển thị thông báo lỗi cho người dùng
    }
}

/*
// (Tùy chọn) Hàm ví dụ để cập nhật số lượng trên icon giỏ hàng
// Bạn cần có một text element gần icon giỏ hàng để hiển thị số lượng, ví dụ: #cartCountText
async function updateCartIconCount() {
    try {
        const cart = await wixStores.cart.getCurrentCart();
        if (cart && cart.lineItems.length > 0) {
            const itemCount = cart.lineItems.reduce((sum, item) => sum + item.quantity, 0);
            $w("#cartCountText").text = itemCount.toString();
            $w("#cartCountText").show();
        } else {
            $w("#cartCountText").text = "0";
            $w("#cartCountText").hide(); // Hoặc .text = "" tùy theo thiết kế
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật số lượng giỏ hàng:", error);
    }
}

// Gọi hàm cập nhật số lượng giỏ hàng khi trang sẵn sàng và mỗi khi giỏ hàng thay đổi
$w.onReady(function () {
    // ... (mã khác của bạn)
    updateCartIconCount();
    wixStores.cart.onCartChanged((cart) => {
        updateCartIconCount();
    });
});
*/

// --- CÁC CHỨC NĂNG MỞ RỘNG BẠN CÓ THỂ THÊM ---

// 1. LỌC SẢN PHẨM (Ví dụ: theo danh mục)
// Giả sử bạn có một dropdown tên là `categoryDropdown`
/*
export function categoryDropdown_change(event) {
    const selectedCategory = $w("#categoryDropdown").value;
    filterProductsByCategory(selectedCategory);
}

async function filterProductsByCategory(categoryId) {
    try {
        let query = wixStores.products.queryProducts();
        if (categoryId && categoryId !== "all") { // "all" là một giá trị ví dụ cho "Tất cả danh mục"
            query = query.hasSome("collections", [categoryId]); // Giả sử categoryId là ID của collection
        }
        const results = await query.limit(20).find();
        if (results.items.length > 0) {
            $w("#productsRepeater").data = results.items;
            $w("#productsRepeater").expand();
            // $w("#noProductsText").hide();
        } else {
            $w("#productsRepeater").data = []; // Xóa sản phẩm cũ
            $w("#productsRepeater").collapse();
            console.log("Không tìm thấy sản phẩm nào cho danh mục này.");
            // $w("#noProductsText").show();
        }
    } catch (error) {
        console.error("Lỗi khi lọc sản phẩm:", error);
    }
}
*/

// 2. SẮP XẾP SẢN PHẨM (Ví dụ: theo giá, tên)
// Giả sử bạn có một dropdown tên là `sortDropdown` với các giá trị "priceAsc", "priceDesc", "nameAsc"
/*
export function sortDropdown_change(event) {
    const sortBy = $w("#sortDropdown").value;
    sortProducts(sortBy);
}

async function sortProducts(sortBy) {
    try {
        let query = wixStores.products.queryProducts();
        switch (sortBy) {
            case "priceAsc":
                query = query.ascending("price");
                break;
            case "priceDesc":
                query = query.descending("price");
                break;
            case "nameAsc":
                query = query.ascending("name");
                break;
            // Thêm các trường hợp sắp xếp khác nếu cần
        }
        const results = await query.limit(20).find();
        $w("#productsRepeater").data = results.items;
    } catch (error) {
        console.error("Lỗi khi sắp xếp sản phẩm:", error);
    }
}
*/

// 3. PHÂN TRANG (Pagination)
// Bạn sẽ cần thêm các nút "Trang trước", "Trang sau" và logic để theo dõi trang hiện tại
// và sử dụng .skip() trong query sản phẩm.
/*
let currentPage = 1;
const productsPerPage = 10; // Số sản phẩm mỗi trang

async function loadProductsWithPagination() {
    try {
        const results = await wixStores.products
            .queryProducts()
            .limit(productsPerPage)
            .skip((currentPage - 1) * productsPerPage)
            .find();

        $w("#productsRepeater").data = results.items;
        // Cập nhật trạng thái của nút phân trang (ẩn/hiện nút "Trang trước", "Trang sau")
        // updatePaginationButtons(results.totalPages, currentPage); // Bạn cần tự viết hàm này
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm với phân trang:", error);
    }
}

export function nextPageButton_click(event) {
    currentPage++;
    loadProductsWithPagination();
}

export function prevPageButton_click(event) {
    if (currentPage > 1) {
        currentPage--;
        loadProductsWithPagination();
    }
}
*/

// Nhớ rằng bạn cần tạo các Lightbox "Thông báo thêm giỏ hàng" và "Lỗi" trong Editor của Wix
// để mã `wixWindow.openLightbox(...)` hoạt động.