//
//  MBHighlightingTextManager.m
//  MicroBlog_RN
//
//  Created by Manton Reece on 4/16/23.
//

#import "MBHighlightingTextManager.h"

#import "MBHighlightingTextView.h"
#import "MBHighlightingTextStorage.h"
#import <React/RCTUIManager.h>

@implementation MBHighlightingTextManager

RCT_EXPORT_MODULE(MBHighlightingTextView)

RCT_EXPORT_VIEW_PROPERTY(onChangeText, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onSelectionChange, RCTBubblingEventBlock)

RCT_CUSTOM_VIEW_PROPERTY(inputAccessoryViewID, NSString, MBHighlightingTextView)
{
  if (json) {
    NSString* input_id = [RCTConvert NSString:json];
    NSLog(@"inputAccessoryViewID = %@", input_id);
  }
}

RCT_CUSTOM_VIEW_PROPERTY(fontSize, NSNumber, MBHighlightingTextView)
{
  if (json) {
    NSInteger font_size = [RCTConvert NSInteger:json];
    NSLog(@"fontSize = %ld", (long)font_size);
  }
}

RCT_CUSTOM_VIEW_PROPERTY(value, NSString, MBHighlightingTextView)
{
  if (json) {
    NSString* new_text = [RCTConvert NSString:json];
    if (self.textView.text != new_text) {
      self.textView.text = new_text;
    }
  }
}

- (UIView *) view
{
  if (UIAccessibilityIsVoiceOverRunning()) {
    // disable highlighting
    self.textStorage = [[NSTextStorage alloc] init];
  }
  else {
    self.textStorage = [[MBHighlightingTextStorage alloc] init];
  }

  // default to screen width
  CGRect r = [UIScreen mainScreen].bounds;
  
  // setup layout and container
  NSLayoutManager* text_layout = [[NSLayoutManager alloc] init];
  CGSize container_size = CGSizeMake (r.size.width, CGFLOAT_MAX);
  NSTextContainer* text_container = [[NSTextContainer alloc] initWithSize:container_size];
  text_container.widthTracksTextView = YES;
  [text_layout addTextContainer:text_container];
  [self.textStorage addLayoutManager:text_layout];

  // make the view (should we use UIScreen.mainScreen.bounds?)
  self.textView = [[MBHighlightingTextView alloc] initWithFrame:r textContainer:text_container];
  self.textView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  self.textView.delegate = self;
  
  // background color
  BOOL darkmode = NO;
  if (@available(iOS 13.0, *)) {
    darkmode = UITraitCollection.currentTraitCollection.userInterfaceStyle == UIUserInterfaceStyleDark;
  }
  if (darkmode) {
    self.textView.backgroundColor = [UIColor blackColor];
  }
  else {
    self.textView.backgroundColor = [UIColor whiteColor];
  }
  
  // default text
  NSString* s = @"";
  NSAttributedString* attr_s = [[NSAttributedString alloc] initWithString:s attributes:@{}];
  self.textView.attributedText = attr_s;
  [self.textStorage setAttributedString:attr_s];

  return self.textView;
}

- (void) textViewDidChange:(UITextView *)textView
{
  NSLog (@"textViewDidChange");
  MBHighlightingTextView* v = (MBHighlightingTextView *)textView;
  [v callTextChanged:textView.text];
}

- (void) textViewDidChangeSelection:(UITextView *)textView
{
  NSLog (@"textViewDidChangeSelection");
  MBHighlightingTextView* v = (MBHighlightingTextView *)textView;
  UITextRange* range = textView.selectedTextRange;
  [v callSelectionChanged:range];
}

@end
