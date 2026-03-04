import { useTenant } from "@/contexts/TenantContext";

export type IndustryKeyword = 
    | "Product"
    | "Products"
    | "Order"
    | "Orders"
    | "Customer"
    | "Customers"
    | "Category"
    | "Categories"
    | "Cart"
    | "Checkout"
    | "Store"
    | "Catalog"
    | "Price"
    | "SKU";

const DICTIONARY: Record<string, Record<IndustryKeyword, string>> = {
    retail: {
        Product: "Product",
        Products: "Products",
        Order: "Order",
        Orders: "Orders",
        Customer: "Customer",
        Customers: "Customers",
        Category: "Category",
        Categories: "Categories",
        Cart: "Cart",
        Checkout: "Checkout",
        Store: "Store",
        Catalog: "Catalog",
        Price: "Price",
        SKU: "SKU"
    },
    education: {
        Product: "Course",
        Products: "Courses",
        Order: "Enrollment",
        Orders: "Enrollments",
        Customer: "Student",
        Customers: "Students",
        Category: "Department",
        Categories: "Departments",
        Cart: "Selection",
        Checkout: "Register",
        Store: "Portal",
        Catalog: "Curriculum",
        Price: "Fee",
        SKU: "Course Code"
    },
    services: {
        Product: "Service",
        Products: "Services",
        Order: "Booking",
        Orders: "Bookings",
        Customer: "Client",
        Customers: "Clients",
        Category: "Category",
        Categories: "Categories",
        Cart: "Selected Services",
        Checkout: "Book Now",
        Store: "Portal",
        Catalog: "Portfolio",
        Price: "Rate",
        SKU: "Service ID"
    },
    hospitality: {
        Product: "Room/Package",
        Products: "Rooms",
        Order: "Reservation",
        Orders: "Reservations",
        Customer: "Guest",
        Customers: "Guests",
        Category: "Room Type",
        Categories: "Room Types",
        Cart: "Selection",
        Checkout: "Reserve",
        Store: "Property",
        Catalog: "Availability",
        Price: "Tariff",
        SKU: "Room Number"
    }
};

export const useDictionary = () => {
    const { activeCompany } = useTenant();
    const industry = activeCompany?.industry_type || "retail";
    const dict = DICTIONARY[industry] || DICTIONARY.retail;

    const t = (word: IndustryKeyword): string => {
        return dict[word] || word;
    };

    return { t, industry, dict };
};
