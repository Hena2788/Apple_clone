import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Four04 from "../Four04/Four04";
import { axiosInstance } from "../../utils/axiosInstance";
const Product = () => {
  //   console.log(useParams());
  const { id } = useParams();
  const [singleProduct, setSingleProduct] = useState(null);
  useEffect(() => {
    const getSingleProduct = async () => {
      const response = await axiosInstance(`iphones/${id}`);
      setSingleProduct(response.data);
    };
    getSingleProduct();
  }, []);

  if (singleProduct) {
    return (
      <div>
        <section className="internal-page-wrapper">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-12 mt-5 pt-5">
                <div className="title-wraper font-weight-bold">
                  {singleProduct?.product_name}
                </div>
                <div className="brief-description">
                  {singleProduct?.product_brief_description}
                </div>
              </div>
            </div>

            <div className="row justify-content-center text-center product-holder h-100 m-5">
              <div className={`col-sm-12 col-md-6 my-auto`}>
                <div className="starting-price">
                  {`Starting at ${singleProduct?.starting_price}`}
                </div>
                <div className="monthly-price">
                  {singleProduct?.price_range}
                </div>
                <div className="product-details">
                  {singleProduct?.product_description}
                </div>
              </div>

              <div className={`col-sm-12 col-md-6`}>
                <div className="prodict-image">
                  <img src={singleProduct?.product_img} alt="product" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  } else {
    return <Four04 />;
  }
};

export default Product;
