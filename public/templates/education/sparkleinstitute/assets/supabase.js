/* ============================================================
   Sparkle Allied Health Science — Supabase API & Utilities
   Static site data layer using Supabase REST API
   ============================================================ */

(function () {
  'use strict';

  // ---------- Configuration ----------
  const SUPABASE_URL = window.SPARKLE_CONFIG?.supabaseUrl || '';
  const SUPABASE_KEY = window.SPARKLE_CONFIG?.supabaseKey || '';
  const SUBSCRIBER_ID = window.SPARKLE_CONFIG?.subscriberId || '';

  // ---------- Supabase Client ----------
  let supabase = null;

  function initSupabase() {
    if (!supabase && window.supabase) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return supabase;
  }

  // ---------- API Functions ----------

  /**
   * Fetch all published programs (master_items joined with categories and brands)
   */
  async function fetchPrograms() {
    const client = initSupabase();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('master_items')
        .select(`
          id,
          item_name,
          item_code,
          image_url,
          selling_price,
          description,
          long_description,
          item_type,
          duration_value,
          duration_unit,
          delivery_mode,
          level,
          featured,
          highlights,
          tags,
          created_at,
          master_categories ( name ),
          master_brands ( name )
        `)
        .eq('company_id', SUBSCRIBER_ID)
        .eq('is_live', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching programs:', error);
        return [];
      }

      return (data || []).map(function (item) {
        return {
          id: item.id,
          name: item.item_name,
          code: item.item_code,
          categoryName: item.master_categories?.name || '',
          brandName: item.master_brands?.name || '',
          slug: item.item_code,
          thumbnailUrl: item.image_url,
          price: item.selling_price,
          shortDescription: item.description,
          longDescription: item.long_description,
          serviceType: item.item_type,
          duration: item.duration_value ? (item.duration_value + ' ' + (item.duration_unit || '')) : '',
          deliveryMode: item.delivery_mode,
          level: item.level,
          featured: item.featured,
          highlights: item.highlights,
          tags: item.tags,
          createdAt: item.created_at
        };
      });
    } catch (err) {
      console.error('fetchPrograms exception:', err);
      return [];
    }
  }

  /**
   * Fetch a single program detail by ID or item_code
   */
  async function fetchProgramDetail(id) {
    const client = initSupabase();
    if (!client) return null;

    try {
      // Try by UUID first
      let { data, error } = await client
        .from('master_items')
        .select(`
          id,
          item_name,
          item_code,
          image_url,
          selling_price,
          description,
          long_description,
          item_type,
          duration_value,
          duration_unit,
          delivery_mode,
          level,
          featured,
          highlights,
          tags,
          eligibility,
          brochure_url,
          web_title,
          seo_description,
          created_at,
          master_categories ( name ),
          master_brands ( name )
        `)
        .eq('company_id', SUBSCRIBER_ID)
        .eq('id', id)
        .single();

      // Fallback: try by item_code (slug)
      if (error || !data) {
        var result = await client
          .from('master_items')
          .select(`
            id,
            item_name,
            item_code,
            image_url,
            selling_price,
            description,
            long_description,
            item_type,
            duration_value,
            duration_unit,
            delivery_mode,
            level,
            featured,
            highlights,
            tags,
            eligibility,
            brochure_url,
            web_title,
            seo_description,
            created_at,
            master_categories ( name ),
            master_brands ( name )
          `)
          .eq('company_id', SUBSCRIBER_ID)
          .ilike('item_code', id)
          .single();

        data = result.data;
        error = result.error;
      }

      if (error || !data) {
        console.error('Error fetching program detail:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.item_name,
        code: data.item_code,
        categoryName: data.master_categories?.name || '',
        brandName: data.master_brands?.name || '',
        slug: data.item_code,
        thumbnailUrl: data.image_url,
        price: data.selling_price,
        shortDescription: data.description,
        longDescription: data.long_description,
        serviceType: data.item_type,
        duration: data.duration_value ? (data.duration_value + ' ' + (data.duration_unit || '')) : '',
        deliveryMode: data.delivery_mode,
        level: data.level,
        featured: data.featured,
        highlights: data.highlights,
        tags: data.tags,
        eligibility: data.eligibility,
        brochureUrl: data.brochure_url,
        metaTitle: data.web_title,
        metaDescription: data.seo_description,
        createdAt: data.created_at
      };
    } catch (err) {
      console.error('fetchProgramDetail exception:', err);
      return null;
    }
  }

  /**
   * Fetch active categories (returns array of name strings)
   */
  async function fetchCategories() {
    var client = initSupabase();
    if (!client) return [];

    try {
      var { data, error } = await client
        .from('master_categories')
        .select('name')
        .eq('company_id', SUBSCRIBER_ID)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return (data || []).map(function (c) { return c.name; });
    } catch (err) {
      console.error('fetchCategories exception:', err);
      return [];
    }
  }

  /**
   * Create a new enquiry
   */
  async function createEnquiry({ name, email, phone, courseName, message }) {
    var client = initSupabase();
    if (!client) throw new Error('Supabase not initialized');

    var { data, error } = await client
      .from('web_enquiries')
      .insert([{
        company_id: SUBSCRIBER_ID,
        name: name,
        email: email,
        phone: phone || null,
        program_name: courseName || null,
        message: message || null,
        source: 'website',
        status: 'new'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating enquiry:', error);
      throw error;
    }

    return data;
  }

  /**
   * Fetch gallery items
   */
  async function fetchGallery() {
    var client = initSupabase();
    if (!client) return [];

    try {
      var { data, error } = await client
        .from('gallery_items')
        .select('id, title, description, media_url, media_type, is_featured, category')
        .eq('company_id', SUBSCRIBER_ID)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching gallery:', error);
        return [];
      }

      return (data || []).map(function (item) {
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          mediaUrl: item.media_url,
          mediaType: item.media_type,
          isFeatured: item.is_featured,
          category: item.category
        };
      });
    } catch (err) {
      console.error('fetchGallery exception:', err);
      return [];
    }
  }

  /**
   * Fetch published blog posts
   */
  async function fetchBlogPosts() {
    var client = initSupabase();
    if (!client) return [];

    try {
      var { data, error } = await client
        .from('blog_posts')
        .select('*')
        .eq('company_id', SUBSCRIBER_ID)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('fetchBlogPosts exception:', err);
      return [];
    }
  }

  /**
   * Fetch published FAQs
   */
  async function fetchFAQs() {
    var client = initSupabase();
    if (!client) return [];

    try {
      var { data, error } = await client
        .from('web_faqs')
        .select('*')
        .eq('company_id', SUBSCRIBER_ID)
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching FAQs:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('fetchFAQs exception:', err);
      return [];
    }
  }

  /**
   * Fetch published testimonials
   */
  async function fetchTestimonials() {
    var client = initSupabase();
    if (!client) return [];

    try {
      var { data, error } = await client
        .from('web_testimonials')
        .select('*')
        .eq('company_id', SUBSCRIBER_ID)
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching testimonials:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('fetchTestimonials exception:', err);
      return [];
    }
  }

  /**
   * Fetch published events
   */
  async function fetchEvents() {
    var client = initSupabase();
    if (!client) return [];

    try {
      var { data, error } = await client
        .from('web_events')
        .select('*')
        .eq('company_id', SUBSCRIBER_ID)
        .eq('is_published', true)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('fetchEvents exception:', err);
      return [];
    }
  }

  // ---------- Utility Functions ----------

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - 'success' | 'error' | 'info'
   */
  function showToast(message, type) {
    type = type || 'success';

    // Ensure toast container exists
    var container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    // Icon SVGs
    var icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML =
      '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' +
      '<span class="toast-message">' + message + '</span>' +
      '<button class="toast-close" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>';

    container.appendChild(toast);

    // Close handler
    var closeBtn = toast.querySelector('.toast-close');
    function removeToast() {
      toast.classList.add('removing');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }

    closeBtn.addEventListener('click', removeToast);

    // Auto-dismiss after 5 seconds
    setTimeout(removeToast, 5000);
  }

  /**
   * Initialize reveal animations via IntersectionObserver
   */
  function initRevealAnimations() {
    var elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: show all immediately
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /**
   * Initialize navbar scroll behavior and mobile menu toggle
   */
  function initNavbar() {
    var navbar = document.querySelector('.navbar');
    var toggle = document.querySelector('.navbar-toggle');
    var mobileMenu = document.querySelector('.navbar-mobile');

    if (!navbar) return;

    // Scroll handler - add/remove 'scrolled' class
    function onScroll() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initial check

    // Mobile menu toggle
    if (toggle && mobileMenu) {
      toggle.addEventListener('click', function () {
        toggle.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
      });

      // Close mobile menu when clicking a link
      var mobileLinks = mobileMenu.querySelectorAll('.navbar-link');
      mobileLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          toggle.classList.remove('active');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /**
   * Extract YouTube video ID from a URL
   * @param {string} url - YouTube URL
   * @returns {string|null} Video ID or null
   */
  function getYouTubeId(url) {
    if (!url) return null;

    var patterns = [
      /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = url.match(patterns[i]);
      if (match) return match[1];
    }

    return null;
  }

  // ---------- Export on window.SparkleAPI ----------
  window.SparkleAPI = {
    initSupabase: initSupabase,
    fetchPrograms: fetchPrograms,
    fetchProgramDetail: fetchProgramDetail,
    fetchCategories: fetchCategories,
    createEnquiry: createEnquiry,
    fetchGallery: fetchGallery,
    fetchBlogPosts: fetchBlogPosts,
    fetchFAQs: fetchFAQs,
    fetchTestimonials: fetchTestimonials,
    fetchEvents: fetchEvents,
    showToast: showToast,
    initRevealAnimations: initRevealAnimations,
    initNavbar: initNavbar,
    getYouTubeId: getYouTubeId
  };

  // Auto-initialize common features when DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    initSupabase();
    initNavbar();
    initRevealAnimations();
  });

})();
