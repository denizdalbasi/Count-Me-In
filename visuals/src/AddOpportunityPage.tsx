import { useState, type FormEvent } from "react";
import { api } from "./api";
import { CATEGORIES, type NewOpportunity, type Opportunity, type Profile } from "./opportunity";

type AddOpportunityPageProps = {
  profile: Profile;
  onCancel: () => void;
  onCreated: (opportunity: Opportunity) => void;
};

export default function AddOpportunityPage({
  profile,
  onCancel,
  onCreated,
}: AddOpportunityPageProps) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const organizationName = String(data.get("organizationName")).trim();
    const title = String(data.get("title")).trim();
    const description = String(data.get("description")).trim();
    const url = String(data.get("url")).trim();
    const locationName = String(data.get("locationName")).trim();
    const address = String(data.get("address")).trim();
    const minAge = Number(data.get("minAge"));
    const maxAge = Number(data.get("maxAge"));
    if (
      !organizationName ||
      !data.get("category") ||
      !title ||
      !description ||
      !url ||
      !locationName ||
      !address ||
      !Number.isFinite(minAge) ||
      !Number.isFinite(maxAge)
    ) {
      setError("Complete every field before adding the opportunity.");
      return;
    }
    if (minAge > maxAge) {
      setError("Maximum age must be greater than or equal to minimum age.");
      return;
    }

    const opportunity: NewOpportunity = {
      organizationId: profile.id,
      organizationName,
      category: String(data.get("category")) as NewOpportunity["category"],
      title,
      description,
      minAge,
      maxAge,
      url,
      locationName,
      address,
    };

    setSubmitting(true);
    try {
      onCreated(await api.createOpportunity(opportunity));
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The opportunity could not be added.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="shell add-opportunity-page">
      <button className="back-link" onClick={onCancel}>
        ← Back to opportunities
      </button>
      <div className="add-opportunity-layout">
        <section className="add-opportunity-intro">
          <p className="eyebrow">Organization tools</p>
          <h1>Add an opportunity</h1>
        </section>

        <form className="add-opportunity-form" onSubmit={handleSubmit}>
          <div className="form-section-heading">
            <span>01</span>
            <div>
              <h2>Opportunity details</h2>
              <p>Give volunteers a clear overview of the role.</p>
            </div>
          </div>

          <div className="add-form-grid">
            <label className="field field--full">
              <span>Organization name</span>
              <input
                name="organizationName"
                defaultValue={profile.name}
                placeholder="Your organization"
                required
              />
            </label>
            <label className="field field--full">
              <span>Category</span>
              <select name="category" defaultValue="" required>
                <option value="" disabled>
                  Select a category
                </option>
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="field field--full">
              <span>Title</span>
              <input name="title" placeholder="e.g. Junior Web Developer" required />
            </label>
            <label className="field field--full">
              <span>Description</span>
              <textarea
                name="description"
                rows={5}
                placeholder="Describe the work, responsibilities, and what volunteers can expect."
                required
              />
            </label>
            <label className="field">
              <span>Minimum age</span>
              <input name="minAge" type="number" min="0" max="120" placeholder="18" required />
            </label>
            <label className="field">
              <span>Maximum age</span>
              <input name="maxAge" type="number" min="0" max="120" placeholder="35" required />
            </label>
            <label className="field field--full">
              <span>External URL</span>
              <input name="url" type="url" placeholder="https://example.com/apply" required />
            </label>
          </div>

          <div className="form-section-heading form-section-heading--location">
            <span>02</span>
            <div>
              <h2>Location</h2>
              <p>Tell volunteers where this opportunity takes place.</p>
            </div>
          </div>

          <div className="add-form-grid">
            <label className="field field--full">
              <span>Location name</span>
              <input name="locationName" placeholder="e.g. Toronto" required />
            </label>
            <label className="field field--full">
              <span>Address</span>
              <input
                name="address"
                placeholder="Street address, city, province, postal code"
                required
              />
            </label>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="add-form-actions">
            <button type="button" className="button button--secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="button" disabled={submitting}>
              {submitting ? "Adding opportunity…" : "Add opportunity"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
