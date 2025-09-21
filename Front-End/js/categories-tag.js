const BASE_URL_CATEGORY = "http://localhost:8080/api/v1/category";
const BASE_URL_TAG = "http://localhost:8080/api/v1/tag";

$(document).ready(function () {
  let categories = [];
  let tags = [];

  let editingId = null;
  let editMode = "";
  let userAccountId;

  function init() {
    TokenManager.checkAuthentication();
    SubcriptionManager.initialize();
    DataManager.setProfileInfo();
    setupTabs();
    setupModals();
    setupForms();
    loadDataFromBackend();
  }

  async function loadDataFromBackend() {
    try {
      showLoading();

      userAccountId = DataManager.get("userAccountId");

      let [categoriesData, tagsData] = await Promise.all([
        CategoryTagAPI.getUserCategories(userAccountId),
        CategoryTagAPI.getUserTags(userAccountId),
      ]);

      categories = categoriesData || [];
      tags = tagsData || [];

      loadCategories();
      loadTags();
      hideLoading();
    } catch (error) {
      console.error("Error loading data:", error);
      hideLoading();
      AlertManager.toast("Failed to load data from server", "error");
    }
  }

  function showLoading() {
    $("#categoriesGrid").html(
      '<div class="loading-spinner">Loading categories...</div>'
    );
    $("#tagsGrid").html('<div class="loading-spinner">Loading tags...</div>');
  }

  function hideLoading() {
    // Grid content will be updated by loadCategories() and loadTags()
  }

  function setupTabs() {
    $(".tab-btn").click(function () {
      let tabName = $(this).data("tab");

      $(".tab-btn").removeClass("active");
      $(this).addClass("active");

      $(".tab-content").removeClass("active");
      $("#" + tabName + "-tab").addClass("active");
    });
  }

  function loadCategories() {
    let grid = $("#categoriesGrid");
    grid.empty();

    if (categories.length === 0) {
      grid.html(getEmptyState("categories"));
      return;
    }

    $.each(categories, function (index, category) {
      let categoryCard = createCategoryCard(category);
      grid.append(categoryCard);
    });
  }

  function createCategoryCard(category) {
    let type = category.transactionType;
    let typeIcon =
      type === "INCOME"
        ? "fa-arrow-up"
        : type === "EXPENSE"
        ? "fa-arrow-down"
        : " fa-exchange-alt ";

    type = type.toLowerCase();

    return `
      <div class="item-card ${type}">
        <div class="item-header">
          <div class="item-info">
            <div class="item-name">${category.name}</div>
            <div class="item-type ${type}">
              <i class="fas ${typeIcon}"></i>
              ${type}
            </div>
          </div>
          <div class="item-actions">
            <button class="btn-action btn-edit" onclick="editCategory(${
              category.id
            })" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-action btn-delete" onclick="deleteCategory(${
              category.id
            })" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="item-stats">
          <div class="stat-item">
            <div class="stat-value">${category.transactionCount}</div>
            <div class="stat-label">Transactions</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">$${Math.abs(
              category.totalAmount
            ).toLocaleString()}</div>
            <div class="stat-label">Total Amount</div>
          </div>
        </div>
      </div>
    `;
  }

  function loadTags() {
    let grid = $("#tagsGrid");
    grid.empty();

    if (tags.length === 0) {
      grid.html(getEmptyState("tags"));
      return;
    }

    $.each(tags, function (index, tag) {
      let tagCard = createTagCard(tag);
      grid.append(tagCard);
    });
  }

  function createTagCard(tag) {
    return `
      <div class="item-card tag">
        <div class="item-header">
          <div class="item-info">
            <div class="item-name">${tag.name}</div>
            <div class="item-type tag">
              <i class="fas fa-tag"></i>
              Tag
            </div>
          </div>
          <div class="item-actions">
            <button class="btn-action btn-edit" onclick="editTag(${
              tag.id
            })" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-action btn-delete" onclick="deleteTag(${
              tag.id
            })" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="item-stats">
          <div class="stat-item">
            <div class="stat-value">${tag.transactionCount}</div>
            <div class="stat-label">Transactions</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${new Date().getFullYear()}</div>
            <div class="stat-label">Created</div>
          </div>
        </div>
      </div>
    `;
  }

  function getEmptyState(type) {
    if (type === "categories") {
      return `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">
            <i class="fas fa-folder-open"></i>
          </div>
          <div class="empty-title">No Categories Yet</div>
          <div class="empty-description">Create your first category to organize your transactions</div>
         
        </div>
      `;
    } else {
      return `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">
            <i class="fas fa-tags"></i>
          </div>
          <div class="empty-title">No Tags Yet</div>
          <div class="empty-description">Create tags for flexible transaction labeling</div>
          
        </div>
      `;
    }
  }

  function openCategoryModal(id) {
    editMode = "category";
    editingId = id || null;

    if (id) {
      let category = findCategoryById(id);
      $("#categoryModalTitle").text("Edit Category");
      $("#categorySubmitText").text("Update Category");
      $("#categoryName").val(category.name);
      $("#categoryType").val(category.type);
    } else {
      $("#categoryModalTitle").text("Add New Category");
      $("#categorySubmitText").text("Create Category");
      $("#categoryForm")[0].reset();
    }

    $("#categoryModal").addClass("show");
  }

  function closeCategoryModal() {
    $("#categoryModal").removeClass("show");
    editingId = null;
    editMode = "";
  }

  function editCategory(id) {
    openCategoryModal(id);
  }

  function findCategoryById(id) {
    return categories.find(function (category) {
      return category.id === id;
    });
  }

  // Tag Functions
  function openTagModal(id) {
    editMode = "tag";
    editingId = id || null;

    if (id) {
      let tag = findTagById(id);
      $("#tagModalTitle").text("Edit Tag");
      $("#tagSubmitText").text("Update Tag");
      $("#tagName").val(tag.name);
    } else {
      $("#tagModalTitle").text("Add New Tag");
      $("#tagSubmitText").text("Create Tag");
      $("#tagForm")[0].reset();
    }

    $("#tagModal").addClass("show");
  }

  function closeTagModal() {
    $("#tagModal").removeClass("show");
    editingId = null;
    editMode = "";
  }

  function findTagById(id) {
    return tags.find(function (tag) {
      return tag.id === id;
    });
  }

  function editTag(id) {
    openTagModal(id);
  }

  function deleteTag(id) {
    deleteTag(id);
  }

  function setupForms() {
    $("#categoryForm").submit(function (e) {
      e.preventDefault();

      let name = $("#categoryName").val().trim();
      let type = $("#categoryType").val();

      if (!name || !type) {
        AlertManager.toast("Please fill in all fields", "error");
        return;
      }

      if (editingId) {
        updateCategory(editingId, name, type);
      } else {
        createCategory(name, type);
      }
    });

    $("#tagForm").submit(function (e) {
      e.preventDefault();

      let name = $("#tagName").val().trim();

      if (!name) {
        AlertManager.toast("Please enter a tag name", "error");
        return;
      }

      if (editingId) {
        updateTag(editingId, name);
      } else {
        createTag(name);
      }
    });
  }

  async function createCategory(name, type) {
    try {
      let newCategory = await CategoryTagAPI.createCategory({
        name: name,
        type: type,
      });

      categories.push(newCategory);
      loadCategories();
      closeCategoryModal();
      AlertManager.toast("Category created successfully", "success");
    } catch (error) {
      AlertManager.toast("Failed to create category", "error");
    }
  }

  async function updateCategory(id, name, type) {
    console.log("UDATE", id, "info");
    try {
      let updatedCategory = await CategoryTagAPI.updateCategory(id, {
        id: id,
        name: name,
        type: type,
      });

      let categoryIndex = categories.findIndex(function (category) {
        return category.id === id;
      });

      if (categoryIndex !== -1) {
        categories[categoryIndex] = updatedCategory;
        loadCategories();
        closeCategoryModal();
        AlertManager.toast("Category updated successfully", "success");
      }
    } catch (error) {
      AlertManager.toast("Failed to update category", "error");
    }
  }

  async function deleteCategory(id) {
    if (
      confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      try {
        await CategoryTagAPI.deleteCategory(id);

        categories = categories.filter(function (category) {
          return category.id !== id;
        });

        loadCategories();
        AlertManager.toast("Category deleted successfully", "success");
      } catch (error) {
        AlertManager.toast("Failed to delete category", "error");
      }
    }
  }

  // Tag CRUD Operations
  async function createTag(name) {
    try {
      let newTag = await CategoryTagAPI.createTag({
        name: name,
      });

      tags.push(newTag);
      loadTags();
      closeTagModal();
      AlertManager.toast("Tag created successfully", "success");
    } catch (error) {
      AlertManager.toast("Failed to create tag", "error");
    }
  }

  async function updateTag(id, name) {
    try {
      let updatedTag = await CategoryTagAPI.updateTag(id, {
        name: name,
      });

      let tagIndex = tags.findIndex(function (tag) {
        return tag.id === id;
      });

      if (tagIndex !== -1) {
        tags[tagIndex] = updatedTag;
        loadTags();
        closeTagModal();
        AlertManager.toast("Tag updated successfully", "success");
      }
    } catch (error) {
      AlertManager.toast("Failed to update tag", "error");
    }
  }

  async function deleteTag(id) {
    if (
      confirm(
        "Are you sure you want to delete this tag? This action cannot be undone."
      )
    ) {
      try {
        await CategoryTagAPI.deleteTag(id);

        tags = tags.filter(function (tag) {
          return tag.id !== id;
        });

        loadTags();
        AlertManager.toast("Tag deleted successfully", "success");
      } catch (error) {
        AlertManager.toast("Failed to delete tag", "error");
      }
    }
  }

  // Modal Setup
  function setupModals() {
    $(document).keydown(function (e) {
      if (e.key === "Escape") {
        closeCategoryModal();
        closeTagModal();
      }
    });

    $("#categoryModal, #tagModal").click(function (e) {
      if (e.target === this) {
        closeCategoryModal();
        closeTagModal();
      }
    });
  }

  let CategoryTagAPI = {
    handleResponse: async function (response) {
      let apiResponse = await response.json();

      if (apiResponse.status === 200 || apiResponse.status === 201) {
        return apiResponse.data;
      }

      AlertManager.toast(apiResponse.message, "warning");
      throw new Error(apiResponse.message || "API Error");
    },

    createCategory: async function (categoryData) {
      try {
        let response = await window.apiCall(
          `${BASE_URL_CATEGORY}/${userAccountId}`,
          {
            method: "POST",
            body: JSON.stringify({
              name: categoryData.name,
              transactionType: categoryData.type,
            }),
          }
        );
        return await this.handleResponse(response);
      } catch (error) {
        AlertManager.toast("Failed to create category:", "warning");
        console.error("Error creating category:", error);
        throw error;
      }
    },

    updateCategory: async function (categoryId, categoryData) {
      console.log("USER ID FOR UPDATE", userAccountId);
      console.log(DataManager.get("userAccountId"));
      try {
        let response = await window.apiCall(
          `${BASE_URL_CATEGORY}/update/${categoryId}?userAccId=${userAccountId}`,
          {
            method: "PUT",
            body: JSON.stringify({
              name: categoryData.name,
              transactionType: categoryData.type,
            }),
          }
        );
        return await this.handleResponse(response);
      } catch (error) {
        AlertManager.toast("Failed to update category:", "warning");
        console.error("Error updating category:", error);
        throw error;
      }
    },

    deleteCategory: async function (categoryId) {
      try {
        let response = await window.apiCall(
          `${BASE_URL_CATEGORY}/${categoryId}`,
          {
            method: "DELETE",
          }
        );
        return await this.handleResponse(response);
      } catch (error) {
        console.error("Error deleting category:", error);
        AlertManager.toast(error, "error");
        throw error;
      }
    },

    getUserCategories: async function (userAccountId) {
      try {
        let response = await window.apiCall(
          `${BASE_URL_CATEGORY}/${userAccountId}/categories`
        );
        return await this.handleResponse(response);
      } catch (error) {
        AlertManager.toast("Failed to fetch categories", "warning");
        console.error("Error fetching categories:", error);
        throw error;
      }
    },

    createTag: async function (tagData) {
      try {
        let response = await window.apiCall(
          `${BASE_URL_TAG}/${userAccountId}`,
          {
            method: "POST",
            body: JSON.stringify({
              name: tagData.name,
            }),
          }
        );
        return await this.handleResponse(response);
      } catch (error) {
        AlertManager.toast("Failed to create tag:", "warning");
        console.error("Error creating tag:", error);
        throw error;
      }
    },

    updateTag: async function (tagId, tagData) {
      try {
        let response = await window.apiCall("/api/tags/" + tagId, {
          method: "PUT",
          body: JSON.stringify({
            name: tagData.name,
          }),
        });
        return await this.handleResponse(response);
      } catch (error) {
        AlertManager.toast("Failed to update tag:", "warning");
        console.error("Error updating tag:", error);
        throw error;
      }
    },

    deleteTag: async function (tagId) {
      try {
        let response = await window.apiCall("/api/tags/" + tagId, {
          method: "DELETE",
        });
        return await this.handleResponse(response);
      } catch (error) {
        AlertManager.toast("Failed to delete tag:", "warning");
        console.error("Error deleting tag:", error);
        throw error;
      }
    },

    getUserTags: async function (userAccountId) {
      try {
        let response = await window.apiCall(
          `${BASE_URL_TAG}/${userAccountId}/tags`
        );
        return await this.handleResponse(response);
      } catch (error) {
        AlertManager.toast("Failed to fetch tags:", "warning");
        console.error("Error fetching tags:", error);
        throw error;
      }
    },
  };

  window.openCategoryModal = openCategoryModal;
  window.closeCategoryModal = closeCategoryModal;
  window.editCategory = editCategory;
  window.deleteCategory = deleteCategory;
  window.openTagModal = openTagModal;
  window.closeTagModal = closeTagModal;
  window.editTag = editTag;
  window.deleteTag = deleteTag;

  init();
});
