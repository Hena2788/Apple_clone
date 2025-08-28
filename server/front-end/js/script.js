document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("productForm")
    const submitBtn = document.getElementById("submitBtn")
    const responseMessage = document.getElementById("responseMessage")

    // Regex for basic URL validation
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/

    // Function to validate a single input field
    function validateField(inputElement) {
        const value = inputElement.value.trim()
        const name = inputElement.name
        let isValid = true
        let errorMessage = ""

        // Clear previous validation states
        inputElement.classList.remove("is-invalid", "is-valid")
        const feedbackElement = inputElement.nextElementSibling
        if (feedbackElement && feedbackElement.classList.contains("invalid-feedback")) {
            feedbackElement.textContent = "" // Clear specific message
        }

        if (inputElement.hasAttribute("required") && value === "") {
            isValid = false
            errorMessage = `${inputElement.previousElementSibling.textContent.trim()} is required.`
        } else if (name === "product_url" && !urlRegex.test(value)) {
            isValid = false
            errorMessage = "Please enter a valid URL for Product URL."
        } else if (name === "product_img" && !urlRegex.test(value)) {
            isValid = false
            errorMessage = "Please enter a valid URL for Product Image URL."
        } else if (name === "starting_price" && (isNaN(value) || Number.parseFloat(value) <= 0)) {
            isValid = false
            errorMessage = "Starting price must be a positive number."
        }

        if (!isValid) {
            inputElement.classList.add("is-invalid")
            if (feedbackElement && feedbackElement.classList.contains("invalid-feedback")) {
                feedbackElement.textContent = errorMessage
            }
        } else {
            inputElement.classList.add("is-valid")
        }
        return isValid
    }

    // Function to validate the entire form
    function validateForm() {
        let formIsValid = true
        const inputs = productForm.querySelectorAll("input[required], textarea[required]")
        inputs.forEach((input) => {
            if (!validateField(input)) {
                formIsValid = false
            }
        })
        return formIsValid
    }

    // Add real-time validation on input change
    productForm.querySelectorAll("input, textarea").forEach((input) => {
        input.addEventListener("input", () => {
            validateField(input)
        })
    })

    if (productForm) {
        productForm.addEventListener("submit", async (event) => {
            event.preventDefault() // Prevent default form submission

            // Validate form before submission
            if (!validateForm()) {
                responseMessage.textContent = "Please correct the errors in the form."
                responseMessage.classList.add("alert", "alert-warning")
                return // Stop submission if validation fails
            }

            submitBtn.disabled = true // Disable button during submission
            responseMessage.innerHTML = "" // Clear previous messages
            responseMessage.className = "" // Clear previous message styles

            const formData = new FormData(productForm)
            const productData = {}
            formData.forEach((value, key) => {
                productData[key] = value
            })

            try {
                const response = await fetch("/add-product", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(productData),
                })

                const result = await response.json() // Parse JSON response

                if (response.ok) {
                    responseMessage.textContent = result.message || "Product added successfully!"
                    responseMessage.classList.add("alert", "alert-success")
                    productForm.reset() // Clear the form
                    // Clear validation states after successful reset
                    productForm.querySelectorAll(".is-valid, .is-invalid").forEach((el) => {
                        el.classList.remove("is-valid", "is-invalid")
                    })
                } else {
                    responseMessage.textContent = result.message || "Failed to add product. Please try again."
                    responseMessage.classList.add("alert", "alert-danger")
                }
            } catch (error) {
                console.error("Error:", error)
                responseMessage.textContent = "An unexpected error occurred. Please check your network connection."
                responseMessage.classList.add("alert", "alert-danger")
            } finally {
                submitBtn.disabled = false // Re-enable button
            }
        })
    }
})
