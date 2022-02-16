<section class="login">

<div class="container d-flex align-items-center justify-content-center mt-5 mb-5" style="box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;">


<form action="/a-product/product-edit/{{book._id}}" id="editProduct" method="post" enctype="multipart/form-data" onsubmit="return validateEditForm()" name="productEdit">
  <div class="form-group">

      <h1 class="text-center font-weight-bold mt-5 mb-5">Edit Book Details</h1>

    <label class="mt-5" for="exampleInputEmail1">Book Name</label>
    <input type="text" name="book_name" class="form-control" value="{{book.book_name}}" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter book name">
  </div>

  <div class="form-group">
    <label for="exampleInputPassword1">Category</label>
    <input type="text" name="book_category" class="form-control" value="{{book.book_category}}" id="exampleInputPassword1" placeholder="Enter category">
  </div>

  <div class="form-group">
    <label for="exampleInputPassword1">Sub Category</label>
    <input type="text" name="book_sub_category" class="form-control" value="{{book.book_sub_category}}" id="exampleInputPassword1" placeholder="Enter sub-category">
  </div>

  <div class="form-group">
    <label for="exampleFormControlTextarea1">Book Description</label>
    <textarea class="form-control" name="book_description" value="{{book.book_description}}" id="exampleFormControlTextarea" placeholder="Enter book description" rows="3"></textarea>
  </div>

  <div class="form-group">
    <label for="exampleFormControlFile1">Add Book Image </label>
    <img src="/book-images/{{book._id}}.jpeg" alt="" style="width: 50px; height:50px;" id="imgView" >
    <input type="file" name="book_image" class="form-control-file" id="exampleFormControlFile1" onchange="viewImage(event)">
  </div>

  <button type="submit" onclick="productEdit()" value="submit" class="btn btn-primary mb-5">Submit</button>
</form>




<div class="col-lg-4">
  <div style="min-height: 380px;" class="card">
  <div class="d-flex justify-content-center">
   <button class="btn btn-warning m-1" type="button" style="display: none;"
  id="crop-btn1">Crop</button>
</div>

<div style="display: flex; justify-content: center; margin-top: 5px;">
  <div id="image-box1" style="width: 350px; height: 350px; display: none;">
 </div>



 </div>

 <div class="text-center" style="width: 100%">

 <div class="container d-grid">
   <button id="confirm-btn1" type="submit" class="btn btn-danger">Save
   Changes</button>
  </div>


  </div>
  </div>
  </div>



</div>
</section>


{/* 
fhsdjdjifjifh */}


<section class="login">

<div class="container d-flex align-items-center justify-content-center mt-5 mb-5" style="box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;">


<form action="/a-product/add-product" id="productAdd" method="post" enctype="multipart/form-data">
  <div class="form-group">

      <h1 class="text-center font-weight-bold mt-5 mb-5">Add Book Details</h1>

    <label class="mt-5" for="exampleInputEmail1">Book Name</label>
    <input type="text" name="book_name" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter book name">
  </div>

  <div class="form-group">
    <label for="exampleInputPassword1">Category</label>
    <input type="text" name="book_category" class="form-control" id="exampleInputPassword1" placeholder="Enter category">
  </div>

  <div class="form-group">
    <label for="exampleInputPassword1">Sub Category</label>
    <input type="text" name="book_sub_category" class="form-control" id="exampleInputPassword1" placeholder="Enter sub-category">
  </div>

  <div class="form-group">
    <label for="exampleFormControlTextarea1">Book Description</label>
    <textarea class="form-control" name="book_description" id="exampleFormControlTextarea1" placeholder="Enter book description" rows="3"></textarea>
  </div>

  <div class="form-group">
    <label for="exampleFormControlFile1">Add Book Image </label>
    <input type="file" name="book_image" class="form-control-file" id="exampleFormControlFile1">
  </div>

  <button type="submit" onclick="addProduct()" class="btn btn-primary mb-5">Submit</button>
</form>



</div>
</section>
  

if(userCart) {
            await db.get().collection(collection.CART_COLLECTION).updateOne({user : objectId(userId)} ,
            {
                $push : {
                    product : objectId(productId)
                }
            })
            resolve()
        }
