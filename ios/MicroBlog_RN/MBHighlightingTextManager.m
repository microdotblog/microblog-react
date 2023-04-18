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

//RCT_EXPORT_VIEW_PROPERTY(onChangeText, RCTBubblingEventBlock)
//RCT_EXPORT_VIEW_PROPERTY(onSelectionChange, RCTBubblingEventBlock)

RCT_CUSTOM_VIEW_PROPERTY(inputAccessoryViewID, NSString, MBHighlightingTextView)
{
  if (json) {
    NSString* input_id = [RCTConvert NSString:json];
    NSLog(@"inputAccessoryViewID = %@", input_id);
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
  MBHighlightingTextView* text_view = [[MBHighlightingTextView alloc] initWithFrame:r textContainer:text_container];
  text_view.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  text_view.delegate = self;
  
  // background color
  BOOL darkmode = NO;
  if (@available(iOS 13.0, *)) {
    darkmode = UITraitCollection.currentTraitCollection.userInterfaceStyle == UIUserInterfaceStyleDark;
  }
  if (darkmode) {
    text_view.backgroundColor = [UIColor blackColor];
  }
  else {
    text_view.backgroundColor = [UIColor whiteColor];
  }
  
  // default text
  NSString* s = @"";
  NSAttributedString* attr_s = [[NSAttributedString alloc] initWithString:s attributes:@{}];
  text_view.attributedText = attr_s;
  [self.textStorage setAttributedString:attr_s];

  return text_view;
}

- (void) textViewDidChange:(UITextView *)textView
{
  NSLog (@"textViewDidChange");
}

- (void) textViewDidChangeSelection:(UITextView *)textView
{
  NSLog (@"textViewDidChangeSelection");
}

@end
